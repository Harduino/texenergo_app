/**
 * Created by Egor Lobanov on 24.02.16.
 */
(function(){
    "use strict";

    var module = angular.module('angular.d3', []);

    module.directive('forceLayoutGraph', [function(){
        var _colors = d3.scale.category20().range();
        var _defaultConfig = {
            d3:{
                size: [400, 400],
                linkDistance: 80,
                charge: -200
            },
            draggableNodes: true,
            zoomable: true,
            useZoomHandlers: true
        };

        return {
            restrict: 'E',
            scope: {
                config: "=",
                data: "="
            },
            link: function(scope, element, attrs){

                updateDefaultWidth();
                //extend default configs
                var _config = scope.config ? angular.extend(_defaultConfig, scope.config || {}) : _defaultConfig,
                    _inDrag = false,
                    _translate = [0, 0],
                    _scale = 1;

                //watch for data changes
                scope.$watch('data', function(dataValue){
                    dataValue && drawChart(dataValue);
                });

                function drawChart(data){
                    var d = data;

                    setEdgesAttributes(d);

                    var force = d3.layout.force()
                        .nodes(d.nodes)
                        .links(d.links);

                    configurate(force);

                    var drag = _config.draggableNodes ?  appendDrag(force) : null;

                    force.start();

                    var d3Element = d3.select(element[0]);
                    d3Element.selectAll("*").remove();

                    var svg = d3Element.append("svg")
                        .attr("width", _config.d3.size[0])
                        .attr("height", _config.d3.size[1]);

                    svg.append("g");

                    var inner = svg.select("g");

                    _config.zoomable && appendZoom(svg, inner);

                    var path = appendLinks(inner, force);
                    var node = appendNodes(inner, d);

                    drag && node.call(drag);

                    _config.tooltip &&  appendTooltip(node);

                    force.on("tick", tickHandler.bind({node: node, path:path}));

                    _config.actions && addListeners(svg, _config.actions);

                }

                function appendLinks(svg, force){
                    svg.append("svg:defs").selectAll("marker")
                        .data(["end"])
                        .enter().append("svg:marker")
                        .attr("id", String)
                        .attr("viewBox", "0 -5 10 10")
                        .attr("refX", 22)
                        .attr("refY", -1.5)
                        .attr("markerWidth", 6)
                        .attr("markerHeight", 6)
                        .attr("orient", "auto")
                        .append("svg:path")
                        .attr("d", "M0,-5L10,0L0,5");

                    var path = svg.append("svg:g").selectAll("path")
                        .data(force.links())
                        .enter().append("svg:path")
                        .attr("class", "link")
                        .attr("marker-end", "url(#end)");

                    return path;

                }

                function appendNodes(svg, data){
                    var node = svg.selectAll(".node")
                        .data(data.nodes)
                        .enter().append("g")
                        .attr("class", "node");

                    node.append('circle')
                        .attr('class', 'circle')
                        .attr('r', 10)
                        .style("fill", function(d, i) { return defineColor(d,i)});

                    node.append("foreignObject")
                        .attr("width", 100)
                        .attr("height", 25)
                        //.text(function(d) {return d.name;})
                        .attr("class", "force-node-label").attr("transform", function(){return "translate(-50," + 10 + ")"})
                        .style("color", function(d){return d.color;})
                        .html(function(d){
                            return '<div>' +
                                    d.number +
                                '</div>';
                        });
                    return node;
                }

                function appendTooltip(node){
                    var tooltip = d3.select("body").append("div")
                        .attr("class", "tooltip graph-tip").style('opacity', 1).style('display', 'none');
                    var $t = $('.graph-tip');

                    node.selectAll('circle').on("mouseover", function(d,i) {
                        if(_inDrag) return;
                        tooltip.style('display', 'block').html(_config.tooltip(d, i));
                        var width = $t.outerWidth(),
                            height = $t.outerHeight(),
                            offsetOfCircle = $(this).offset();

                        tooltip.style("left", (offsetOfCircle.left - width/2 + 10 * _scale) + "px")
                            .style("top", (offsetOfCircle.top - height - 5) + "px");
                    }).on("mouseout", function() {
                        tooltip.style('display', 'none');
                    });

                    return tooltip;
                }

                function appendDrag(force){
                    return force.drag()
                        .on("dragstart", function (d) {
                            _inDrag = true;
                            d3.select(this).classed("fixed", d.fixed = true);
                            $('force-layout-graph .tooltip').hide();
                        }).on("dragend", function(d){
                            _inDrag = false;
                            d3.event.sourceEvent.stopPropagation();
                            d3.event.sourceEvent.preventDefault();
                        });
                }

                function appendZoom(svg, inner){
                    var zoom = d3.behavior.zoom().scaleExtent([0.9,3])
                        .on("zoom", function() {
                            if(_inDrag) return;
                            _translate = d3.event.translate;
                            _scale = d3.event.scale;
                            var translate = "translate(" + _translate + ")scale(" + _scale + ")";
                            inner.attr("transform", translate);
                            _config.zoomChange && _config.zoomChange(_scale);
                        });
                    svg.call(zoom);

                    if(_config.useZoomHandlers) {
                        Object.defineProperty(scope.config, "zoom", { set: function (value) {
                            _scale = value;
                            zoom.scale(_scale);
                            var translate = "translate(" + _translate + ")scale(" + _scale + ")";
                            inner.attr("transform", translate);
                        }});
                    }
                }

                function tickHandler(){
                    this.node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

                    this.path.attr("d", function(d) {
                        var dx = d.target.x - d.source.x,
                            dy = d.target.y - d.source.y,
                            dr = Math.sqrt(dx * dx + dy * dy);
                        return "M" +
                            d.source.x + "," +
                            d.source.y + "A" +
                            dr + "," + dr + " 0 0,1 " +
                            d.target.x + "," +
                            d.target.y;
                    });
                }

                function configurate(force){
                    var f = force;
                    Object.keys(_config.d3).map(function(property){
                        f[property](_config.d3[property]);
                    });
                }

                function setEdgesAttributes(d){
                    var nodeById = d3.map();

                    d.nodes.forEach(function(node) {
                        nodeById.set(node.id, node);
                    });

                    d.links.forEach(function(link) {
                        link.source = nodeById.get(link.from);
                        link.target = nodeById.get(link.to);
                    });
                }

                function addListeners(svg, actions){
                    actions.map(function(item){
                        svg.selectAll(item.select).on(item.action, item.handler);
                    });
                }

                function updateDefaultWidth(){
                    _defaultConfig.d3.size[0] = element.parent().outerWidth();
                }

                function defineColor(item, index){
                    return _config.colorSetter ? _config.colorSetter(item, index) : _colors[index];
                }

                scope.$on("destroy", function(){
                    $('.graph-tip').remove();
                });

//                function placeElementsByCircle(nodes, nodeRadius){
//                    var radius = 100; // radius of the circle
//                    var width = _config.size[0],
//                        height = _config.size[1],
//                        angle = 0,
//                        step = (2*Math.PI) / nodes.length;
//
//                    nodes.map(function(item, ind){
//                        var x, y;
//                        if(ind == 0){
//                            x = width/2-nodeRadius;
//                            y = height/2-nodeRadius;
//                        }else{
//                            x = Math.round(width/2 + radius * Math.cos(angle) - nodeRadius);
//                            y = Math.round(height/2 + radius * Math.sin(angle) - nodeRadius);
//                            angle += step;
//                        }
//                        item.point = {x:x, y:y};
//                    });
//                }
            }
        }
    }]);
}());