/**
 * Created by Egor Lobanov on 24.02.16.
 */
(function(){
    "use strict";

    angular.module('app.quotation_orders').directive('quotationSchema', [function(){
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
                data: "=",
                instanceCallback: '=?'
            },

            link: function(scope, element, attrs){
                // Setting current effective Width
                defaultConfig.d3.size[0] = element.parent().outerWidth();
                defaultConfig.d3.size[1] = element.parent().outerHeight();
                var inDrag = false;


                //могу добавить отслеживание свойств но тогда перерисовка зацикливается, копирование объекта тоже не очень помогает
                scope.$watch('data', function(dataValue){
                    dataValue && scope.drawChart(dataValue);
                });

                // возвращаю scope директивы что бы дать возможность родительскому контролеру
                // получить доступ к его методам
                scope.instanceCallback && scope.instanceCallback(scope);

                // можно подумать о том что бы не перерисовывать каждый раз а добавлять или удалять определенный связи и ноды

                scope.drawChart = function(d) {
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

                    //очищаем элемент перед отрисовкой новой диаграммы
                    element.find("svg").remove();

                    var svg = d3
                        .select(element[0])
                        .append('svg')
                        .attr('width', defaultConfig.d3.size[0])
                        .attr('height', defaultConfig.d3.size[1]);

                    // Common group for all pieces
                    svg.append("g");

                    // Working inside the specified group
                    var inner = svg.select("g");

                    var path = appendLinks(inner, scope.links);
                    var node = appendNodes(inner, scope.nodes);

                    node.call(appendDrag(force));


                    svg.selectAll(".node").on("click", function(item){
                        if (d3.event.defaultPrevented) return;
                        scope.$emit('qos-nodeSelected', item);
                        scope.clearSelection();
                        d3.select(this).classed("selected", true);
                    });

                    force.on("tick", tickHandler.bind({node: node, path:path}));

                    force.start();
                };

                scope.clearSelection = function(){
                    d3.selectAll('.node').classed("selected", false);
                };

                // Связи предоставленные сервером линкуем на будущие кружочки
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

                // Создание динамичной красоты.
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

                // Возмоность двигать кружочки.
                // Единожды передвинутый кружочек "залипает" на одном месте7
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

                // Прикрепляем кружочки вместе с названием и, наведении мышки, описанием.
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
                        .style("fill", function(d, i) { return (d.type==="element" ? "red" : "green"); });

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
                                    break;
                                case "equipment":
                                    t = d.product.name;
                                    break;
                                default:
                                    alert("Fell throught to default at appendNodes function");
                            }
                            return '<div>' + t.substring(0, 10) + '</div>';
                        });

                    var tooltip = d3.select("body")
                        .append("div")
                        .attr("class", "tooltip graph-tip")
                        .style('opacity', 1)
                        .style('display', 'none');
                    var $t = $('.graph-tip');

                    node.selectAll('circle').on("mouseover", function(d,i) {
                        if(inDrag) return;
                        tooltip.style('display', 'block').html(function(){
                            var t;
                            switch(d.type){
                                case "element":
                                    t = "Элемент: " + d.description;
                                    break;
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

                        tooltip.style("left", (offsetOfCircle.left - width/2 + 10) + "px")
                            .style("top", (offsetOfCircle.top - height - 5) + "px");
                    }).on("mouseout", function() {
                        tooltip.style('display', 'none');
                    });

                    return node;
                }


                // Прикрепляем стрелочки.
                // @param svg - рабочая зона
                // @param links - массив со связями
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


                    // TODO 2 - COMPLETED
                    // См. EditQuotationOrderCtrl.js
                    // Там есть sc.removeLink()
                    // При dblclick на стрелочки вывести подтверждение типа: "Точно удалить? Ты не двинулся?"
                    // Если не двинулся, то кинуть запрос на сервер.

                    // !!!!  Нужно ли потом удалить линк или перерисовать ?
                    svg.selectAll('path').on("dblclick", function(d,i) {
                        scope.$emit('qos-removeLink', {link:d, index:i});
                    });

                    return path;

                }
            }
        }
    }]);
}());