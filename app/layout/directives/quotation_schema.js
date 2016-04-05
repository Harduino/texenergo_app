/**
 * Created by Egor Lobanov on 24.02.16.
 */
(function(){
    "use strict";

    angular.module('app.layout').directive('quotationSchema', [function(){
        var defaultConfig = {
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
                data: "="
            },
            link: function(scope, element, attrs){
                // Setting current effective width
                defaultConfig.d3.size[0] = element.parent().outerWidth();

                var inDrag = false;

                // Watch for data changes
                scope.$watch('data', function(dataValue){
                    dataValue && drawChart(dataValue);
                });

                function drawChart(d) {
                    if(d.equipment===undefined) return;
                    if(d.elements===undefined) return;
                    scope.nodes = d.equipment.concat(d.elements);
                    scope.links = d.links;

                    setEdgesAttributes(d);

                    var force = d3
                        .layout
                        .force()
                        .size(defaultConfig.d3.size)
                        .linkDistance(defaultConfig.d3.linkDistance)
                        .charge(defaultConfig.d3.charge)
                        .nodes(scope.nodes)
                        .links(scope.links);

                    var svg = d3
                        .select(element[0])
                        .append('svg')
                        .attr('width', 960)
                        .attr('height', 500);

                    // Common group for all pieces
                    svg.append("g");

                    // Working inside the specified group
                    var inner = svg.select("g");

                    var path = appendLinks(inner, scope.links);
                    var node = appendNodes(inner, scope.nodes);

                    node.call(appendDrag(force));

                    force.on("tick", tickHandler.bind({node: node, path:path}));

                    force.start();
                }

                function setEdgesAttributes(d){
                    var nodeById = d3.map();

                    scope.nodes.forEach(function(node) {
                        nodeById.set(node.id, node);
                    });

                    scope.links.forEach(function(link) {
                        link.source = nodeById.get(link.from.id);
                        link.target = nodeById.get(link.to.id);
                    });
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

                function appendDrag(force) {
                    return force.drag()
                        .on("dragstart", function (d) {
                            inDrag = true;
                            d3.select(this).classed("fixed", d.fixed = true);
                            // $('force-layout-graph .tooltip').hide();
                        }).on("dragend", function(d){
                            inDrag = false;
                            d3.event.sourceEvent.stopPropagation();
                            d3.event.sourceEvent.preventDefault();
                        });
                }

                function appendNodes(svg, nodes) {
                    // Add a group for circle and comment
                    var node = svg.selectAll('.node')
                        .data(nodes)
                        .enter()
                        .append("g")
                        .attr("class", "node");

                    // Append a circle to the group
                    node.append('circle')
                        .attr('r', 10)
                        .attr("class", "circle")
                        .style("fill", function(d, i) { return (d.type==="element" ? "red" : "green"); })

                    // Append a node's description
                    node.append("foreignObject")
                        .attr("width", 100)
                        .attr("height", 25)
                        .attr("class", "force-node-label").attr("transform", function(){return "translate(-50," + 10 + ")"})
                        .style("color", function(d){return d.color;})
                        .html(function(d){
                            var t;
                            switch(d.type){
                                case "element":
                                    t = d.description;
                                    break
                                case "equipment":
                                    t = d.product.name;
                                    break;
                                default:
                                    alert("Fell throught to default at appendNodes function");
                            }
                            return '<div>' + t.substring(0, 10) + '</div>';
                        });




                    var tooltip = d3.select("body").append("div")
                        .attr("class", "tooltip graph-tip").style('opacity', 1).style('display', 'none');
                    var $t = $('.graph-tip');

                    node.selectAll('circle').on("mouseover", function(d,i) {
                        if(inDrag) return;
                        tooltip.style('display', 'block').html(function(){
                            var t;
                            switch(d.type){
                                case "element":
                                    t = "Элемент: " + d.description;
                                    break
                                case "equipment":
                                    t = "Товар: " + d.product.name;
                                    break;
                                default:
                                    alert("Fell throught to default at appendNodes function");
                            }
                            return '<div>' + t + '</div>';
                        });
                        var width = $t.outerWidth(),
                            height = $t.outerHeight(),
                            offsetOfCircle = $(this).offset();

                        tooltip.style("left", (offsetOfCircle.left - width/2 + 10 * 1) + "px")
                            .style("top", (offsetOfCircle.top - height - 5) + "px");
                    }).on("mouseout", function() {
                        tooltip.style('display', 'none');
                    });


                    return node;
                }

                function appendLinks(svg, links){
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
                        .data(links)
                        .enter().append("svg:path")
                        .attr("class", "link")
                        .attr("marker-end", "url(#end)");

                    return path;

                }
            }
        }
    }]);
}());