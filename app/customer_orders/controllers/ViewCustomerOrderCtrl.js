/**
 * Created by Egor Lobanov on 15.11.15.
 */
(function(){

    "use strict";

    angular.module('app.customer_orders').controller('ViewCustomerOrderCtrl', ['$scope', '$state', '$stateParams', 'serverApi', 'funcFactory', '$filter', 'customerOrdersNotifications', function($scope, $state, $stateParams, serverApi, funcFactory, $filter, notifications){
        var sc = $scope;
        sc.order = {};
        sc.total = 0;
        sc.visual = {
            navButtsOptions:[{type:'back', callback:returnBack}, {type: 'edit', callback: goEditCustomerOrder}, {type:'files', callback: showFileModal}, {type: 'send_email', callback: sendCustomerOrder}, {type:'recalculate'}, {type:'logs', callback: goToLogs}, {type:'confirm_order', callback: confirmCustomerOrder}],
            chartOptions: {
                barColor:'rgb(103,135,155)',
                scaleColor:false,
                lineWidth:5,
                lineCap:'circle',
                size:50
            },
            showFileModal: angular.noop,
            titles: window.gon.index.CustomerOrder.objectTitle + ': №'
        };
        sc.data = {
            networkData: null,
            networkActions: [
                {
                    select: '.node',
                    action: 'click',
                    handler: function(e){
                        switch (e.type){
                            case "CustomerOrder" : $state.go('app.customer_orders.view', {id: e.id});
                                break;
                        }
                    }
                }
            ]
        };

        sc.amontPercent = 0;
        sc.dispatchedPercent = 0;

        /**
         * Get order details
         */
        serverApi.getCustomerOrderDetails($stateParams.id, function(result){
            console.log(result.data);
            var order = sc.order = result.data;

            funcFactory.setPageTitle('Заказ ' + sc.order.number);
            sc.amontPercent = funcFactory.getPercent(order.paid_amount, order.total);
            sc.dispatchedPercent = funcFactory.getPercent(order.dispatched_amount, order.total);

            calculateTotals(order);
            completeInitPage(order)
        });

        serverApi.getRelatedOrdersOfCustomer($stateParams.id, function(result){
            sc.data.networkData = result.data;
        });

        function completeInitPage(order){
            sc.fileModalOptions={
                url:'/api/customer_orders/'+ order.id +'/documents',
                files: order.documents,
                r_delete: serverApi.deleteFile,
                view: 'customer_orders',
                id: order.id
            };

            notifications.subscribe({
                channel: 'CustomerOrdersChannel',
                customer_order_id: $stateParams.id
            }, sc.order.customer_order_contents);
        }

        function calculateTotals(order){
            var x, y, i, il;

            // Считаем суммы по входящим платежам
            x = 0;
            y = 0;
            for (i = 0, il = order.incoming_transfers.length; i < il; i++) {
                var t = order.incoming_transfers[i];
                x += t.linked_total;
                y += t.amount;
            }
            sc.total_paid_linked = x;
            sc.total_paid = y;

            // Считаем суммы по отгрузкам
            x = 0;
            y = 0;
            for (i = 0, il=order.dispatch_orders.length; i < il; i++) {
                var d = order.dispatch_orders[i];
                x += d.linked_total;
                y += d.amount;
            }
            sc.total_dispatched_linked = x;
            sc.total_dispatched = y;
        }

        /**
         * следим за изменеиями в коллекции (включая свойства коллекции) при изменении пересчитываем total
         */
        sc.$watch('order.customer_order_contents', function(values){
            if(values){
                var total = 0;

                values.map(function(item){
                    total += $filter('price_net')(item, item.quantity);
                });

                sc.total = total;
            }
        }, true);

        function returnBack(){
            $state.go('app.customer_orders', {});
        }
        
        function goToLogs(){
            $state.go('app.customer_orders.view.logs', {});
        }
        
        function goEditCustomerOrder(){
            $state.go('app.customer_orders.view.edit', {});
        }
        
        function showFileModal(){
            sc.visual.showFileModal();
        }
        
        function sendCustomerOrder(){
            serverApi.sendCustomerOrderInvoice($stateParams.id, function(result){
                if(result.status == 200 && !result.data.errors) {
                    funcFactory.showNotification("Успешно", 'Заказ успешно отправлен.', true);
                } else if (result.status == 200 && result.data.errors) {
                    funcFactory.showNotification("Неудача", result.data.errors, true);
                } else {
                    funcFactory.showNotification("Неудача", 'Ошибка при попытке отправить заказ.', true);
                }
            });
        }

        function confirmCustomerOrder(subdata, item) {
            var data = {
                customer_order:{
                    event: item.event
                }
            };
            serverApi.updateStatusCustomerOrder($stateParams.id, data, function(result){
                if(result.status == 200 && !result.data.errors) {
                    funcFactory.showNotification("Успешно", 'Удалось ' + item.name.toLowerCase() + ' заказ', true);
                    sc.order = result.data;
                } else {
                    funcFactory.showNotification("Не удалось " + item.name.toLowerCase() + ' заказ', result.data.errors);
                }
            });
        }
    }]);
}());