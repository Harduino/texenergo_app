/**
 * Created by Mikhail Arzhaev on 19.11.15.
 */
(function(){

    "use strict";

    angular.module('app.supplier_orders').controller('ViewSupplierOrderCtrl', ['$scope', '$state', '$stateParams', 'serverApi', 'funcFactory', 'supplierOrdersNotifications', function($scope, $state, $stateParams, serverApi, funcFactory, notifications){
        var sc = $scope;
        
        sc._subscription = {};  
        
        sc.data = {
            supplierOrder:{},
            partnersList: [],
            productsList: [],
            total:0
        };

        sc.visual = {
            navButtsOptions:[{type:'back', callback:returnBack}, {type:'confirm_order', callback: updateStatus}, {type:'refresh', callback:refresh}],
            chartOptions: {
                barColor:'rgb(103,135,155)',
                scaleColor:false,
                lineWidth:5,
                lineCap:'circle',
                size:50
            },
            role: {},
            showFileModal: angular.noop,
            titles:window.gon.index.SupplierOrder.objectTitle + ': #'
        };

        sc.amontPercent = 0;

        sc.dispatchedPercent = 0;
        
        sc.productForAppend = {};
        
        sc.pSelectConfig = {
            startPage: 0,
            dataMethod: serverApi.getSearch
        };

        sc.partnerSelectConfig = {
            dataMethod: serverApi.getPartners
        };

        serverApi.getSupplierOrderDetails($stateParams.id, function(result){
            var order = sc.data.supplierOrder = result.data;
            sc.amontPercent = funcFactory.getPercent(order.paid_amount, order.total);
            sc.dispatchedPercent = funcFactory.getPercent(order.received_amount, order.total);

            sc.visual.roles = {
                can_edit: order.can_edit,
                can_confirm: order.can_confirm
            };

            sc.fileModalOptions={
                url:'/api/supplier_orders/'+ order.id +'/documents',
                files: order.documents,
                r_delete: serverApi.deleteFile,
                view: 'supplier_orders',
                id: order.id
            };

            sc._subscription =  notifications.subscribe({
                channel: 'SupplierOrdersChannel',
                supplier_order_id: $stateParams.id
            }, sc.data.supplierOrder);
        });

        function refresh(){
            serverApi.getSupplierOrderDetails($stateParams.id, function(result) {
                var order = sc.data.supplierOrder = result.data;
                sc.amontPercent = funcFactory.getPercent(order.paid_amount, order.total);
                sc.dispatchedPercent = funcFactory.getPercent(order.received_amount, order.total);

                sc.visual.roles = {
                    can_confirm: order.can_confirm
                };
            });
        }

        /**
         * выбор продукта для добавления к заказу
         */
        sc.selectProductForAppend = function(item){
            sc.productForAppend = item;
            sc.productForAppend.id = item.id || item._id;
            sc.productForAppend.quantity = 1;
            sc.productForAppend.price = item.price;
        };

        /**
         * Добавить продукт в список
         */
        sc.appendProduct = function(event){
            var append = function(){
                var t=sc.productForAppend,
                    data = angular.extend(t, {product: {name:t.name, id: t.id}}),
                    post = {
                        product_id: t.id,
                        quantity: t.quantity
                    };
                sc._subscription.send({action: "create_content", data: post });
            };
            if(event){
                if(event.keyCode == 13){
                    append();
                }
            } else append();
        };

        sc.$on('$destroy', function(){
            sc._subscription.send({message: "Я нах пошёл отсюда"});
            sc._subscription && sc._subscription.unsubscribe();
        });

        sc.saveSupplierOrderInfo = function(){
            var supplierOrder = sc.data.supplierOrder;
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
         * Удаление продукта
         * @param item - объект с индексом продукта в листе и id
         */
        sc.removeProduct = function(item){
            sc._subscription.send({action: "destroy_content", data: item});
        }


        function confirmOrder(subdata, item) {
            var data = {
                title: supplierOrder.title,
                description: supplierOrder.description,
                partner_id: supplierOrder.partner.id,
                number: supplierOrder.number
            };
            sc._subscription.send({action: "update", data: data });
        }

        sc.saveProductChange = function(data) {
            var product = data.item;
            sc._subscription.send({action: "update_content", data: product });
        }

        function updateStatus(subdata, item) {
            var data = {
                event: item.event
            };
            sc._subscription.send({action: "update_status", data: data });
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