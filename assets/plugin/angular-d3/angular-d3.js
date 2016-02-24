/**
 * Created by Egor Lobanov on 24.02.16.
 */
(function(){
    "use strict";

    var module = angular.module('angular.d3', []);

    module.directive('forceLayoutGraph', [function(){
        var _defaultConfig = {
            size: [400, 200],
            linkStrength: 0.1,
            friction: 0.9,
            linkDistance: 20,
            charge: -30,
            gravity: 0.1,
            theta: 0.8
        };

        return {
            restrict: 'E',
            scope: {
                actions:"=",
                config: "=",
                data: "="
            },
            link: function(scope, element, attrs){

                updateDefaultWidth();
                //extend default configs
                var _config = scope.config ? angular.extend(_defaultConfig, scope.config || {}) : _defaultConfig;

                //watch for data changes
                scope.$watch('data', function(dataValue){
                    dataValue && drawChart(dataValue);
                });

                function drawChart(data){
                    var d = data;
                    console.log(d);
                    var force = d3.layout.force()
                        .nodes(d.nodes)
                        .links(d.links);

                    configurate(force);

                    var d3Element = d3.select(element[0]);
                    d3Element.selectAll("*").remove();

                    var _color = d3.scale.category20().range();

                    var svg = d3Element.append("svg")
                        .attr("width", _config.size[0])
                        .attr("height", _config.size[1]);

                    var _x = d3.scale.ordinal()
                        .domain(d.nodes)
                        .rangePoints([0, _config.size[0]]).range();

                    var _y = d3.scale.ordinal()
                        .domain(d.nodes)
                        .rangePoints([0, _config.size[1]]).range();

//                    var tip = d3.tip()
//                        .attr('class', 'd3-tip')
//                        .offset([-10, 0])
//                        .html(function (d) {
//                            return  d.number + "";
//                        });
//                    svg.call(tip);

                    var node = svg.selectAll(".node")
                        .data(d.nodes)
                        .enter().append("g")
                        .attr("class", "node")
                        .attr("transform", function(d, i){return "translate("+ _x[i] +"," + _y[i] + ")"})
                        .attr("r", 10)
                        .call(force.drag);
//                        .on('mouseover', tip.show)
//                        .on('mouseout', tip.hide);

                    node.append('circle')
                        .attr('class', 'circle')
                        .attr('r', 10)
                        .style("fill", function(d, i) { return _color[i]});

                    node.append("text")
                        .attr("dx", 12)
                        .attr("dy", ".35em")
                        .text(function(d) { return d.number });

                    scope.actions && addListeners(svg, scope.actions);
                }

                function configurate(force){
                    var f = force;
                    Object.keys(_config).map(function(property){
                        f[property](_config[property]);
                    });
                }

                function addListeners(svg, actions){
                    actions.map(function(item){
                        svg.selectAll(item.select).on(item.action, item.handler);
                    });
                }

                function updateDefaultWidth(){
                    _defaultConfig.size[0] = element.parent().outerWidth();
                }
            }
        }
    }]);
}());