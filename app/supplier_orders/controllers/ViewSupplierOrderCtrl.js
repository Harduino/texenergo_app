/**
 * Created by Mikhail Arzhaev on 19.11.15.
 */
(function(){

    "use strict";

    angular.module('app.supplier_orders').controller('ViewSupplierOrderCtrl', ['$scope', '$state', '$stateParams', 'serverApi', 'funcFactory', function($scope, $state, $stateParams, serverApi, funcFactory){
        var sc = $scope;
        sc.order = {};
        sc.visual = {
            navButtsOptions:[{type:'back', callback:returnBack}, {type:'confirm_order', callback: confirmOrder}, {type:'refresh', callback:refresh}],
            chartOptions: {
                barColor:'rgb(103,135,155)',
                scaleColor:false,
                lineWidth:5,
                lineCap:'circle',
                size:50
            },
            showFileModal: angular.noop,
            titles:window.gon.index.SupplierOrder.objectTitle + ': #'
        };

        sc.amontPercent = 0;
        sc.dispatchedPercent = 0;


        sc.data ={
            partnersList: [],
            productsList: [],
            total:0
        };
        sc.pSelectConfig = {
            startPage: 0,
            dataMethod: serverApi.getSearch
        };
        sc.partnerSelectConfig = {
            dataMethod: serverApi.getPartners
        };

        function refresh(){
            serverApi.getSupplierOrderDetails($stateParams.id, function(result) {
                var order = sc.order = result.data;
                sc.amontPercent = funcFactory.getPercent(order.paid_amount, order.total);
                sc.dispatchedPercent = funcFactory.getPercent(order.received_amount, order.total);

                sc.visual.roles = {
                    can_confirm: order.can_confirm
                };
            });
        }

        serverApi.getSupplierOrderDetails($stateParams.id, function(result){
            var order = sc.order = result.data;
            sc.amontPercent = funcFactory.getPercent(order.paid_amount, order.total);
            sc.dispatchedPercent = funcFactory.getPercent(order.received_amount, order.total);

            sc.visual.roles = {
                can_confirm: order.can_confirm
            };

            sc.fileModalOptions={
                url:'/api/supplier_orders/'+ order.id +'/documents',
                files: order.documents,
                r_delete: serverApi.deleteFile,
                view: 'supplier_orders',
                id: order.id
            };
        });

        sc.saveSupplierOrderInfo = function(){
            var supplierOrder = sc.order;
            var data = {
                    supplier_order:{
                        title: supplierOrder.title,
                        description: supplierOrder.description,
                        partner_id: supplierOrder.partner.id,
                        number: supplierOrder.number
                    }
                };
            serverApi.updateSupplierOrder(supplierOrder.id, data, function(result){
                if(result.status == 200 && !result.data.errors){
                    $.smallBox({
                        title: "Успешно",
                        content: "<i class='fa fa-edit'></i> <i>Заказ "+supplierOrder.number+" успешно отредактирован.</i>",
                        color: "#739E73",
                        iconSmall: "fa fa-check fa-2x fadeInRight animated",
                        timeout: 4000
                    });
                } else {
                    $.smallBox({
                        title: "Ошибка",
                        content: "<i class='fa fa-edit'></i> <i>Не смог обновить заказ "+supplierOrder.number+".</i>",
                        color: "#A90329",
                        iconSmall: "fa fa-close fa-2x fadeInRight animated",
                        timeout: 4000
                    });
                }
            });
        };

        /**
         * выбор продукта для добавления к заказу
         */
        sc.selectProductForAppend = function(item){
            sc.productForAppend = item;
            sc.productForAppend.id = item.id || item._id;
            sc.productForAppend.quantity = 1;
            sc.productForAppend.price = 0;
        };

        sc.appendProduct = function(event){
            var append = function(){
                var t=sc.productForAppend,
                    data = angular.extend(t, {product: {name:t.name, id: t.id}}),
                    post = {
                        product_id: t.id,
                        quantity: t.quantity,
                        price: t.price
                    };

                serverApi.addSupplierOrderProduct(sc.order.id, post,function(result){
                    if(!result.data.errors){
                        sc.productForAppend = {};
                        sc.data.selectedProduct = null;
                        sc.order.supplier_order_contents.push(angular.extend(data, result.data));
                        funcFactory.showNotification('Успешно добавлен продукт', t.name, true);
                        angular.element('#eso_prod_select').data().$uiSelectController.open=true;
                    } else {
                        funcFactory.showNotification('Не удалось добавить продукт', result.data.errors);
                    }
                });
            };
            if(event){
                if(event.keyCode == 13){
                    append();
                }
            } else append();
        };

        /**
         * Обновляет параметры продукта включенного в заказ
         * @param item - данные продукта
         */
        sc.updateProductOfOrder = updateProductOfOrder;

        function updateProductOfOrder(product, index, event){
            var update = function(){
                var data = {
                    quantity: product.quantity,
                    price: product.price
                };
                serverApi.updateSupplierOrderProduct(sc.order.id, product.id, data, function(result){
                    if(!result.data.errors) {
                        var r = sc.order.supplier_order_contents[index];
                        sc.order.supplier_order_contents[index] = angular.extend(r, result.data);
                        funcFactory.showNotification('Успешно обновлены данные продукта', product.name, true);
                    } else {
                        funcFactory.showNotification('Не удалось обновить данные продукта', result.data.errors);
                    }
                });
            };
            if(event){
                if(event.keyCode == 13){
                    update();
                }
            } else {
                update();
            }
        }

        /**
         * Удаление продукта
         * @param item - объект с индексом продукта в листе и id
         */
        function removeProduct(item){
            serverApi.removeSupplierOrderProduct(sc.order.id, item.data.id, function(result){
                if(!result.data.errors) {
                    sc.order.supplier_order_contents.splice(item.index, 1);
                    funcFactory.showNotification('Продукт удален:', item.data.product.name, true);
                } else {
                    funcFactory.showNotification('Не удалось удалить продукт', result.data.errors);
                }
            });
        }


        function confirmOrder(subdata, item) {
            var data = {
                supplier_order:{
                    event: item.event
                }
            };
            serverApi.updateStatusSupplierOrder($stateParams.id, data, function(result){
                if(result.status == 200 && !result.data.errors) {
                    funcFactory.showNotification("Успешно", 'Удалось ' + item.name.toLowerCase() + ' заказ', true);
                    sc.order = result.data;
                } else {
                    funcFactory.showNotification("Не удалось " + item.name.toLowerCase() + ' заказ', result.data.errors);
                }
            });
        }
        
        function goEditSupplierOrder(){
            $state.go('app.supplier_orders.view.edit', $stateParams)
        }

        function returnBack(){
            $state.go('app.supplier_orders', {});
        }
        function showFileModal(){
            sc.visual.showFileModal();
        }
    }]);
}());