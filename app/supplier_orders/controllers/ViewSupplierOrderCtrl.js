/**
 * Created by Mikhail Arzhaev on 19.11.15.
 */
(function(){

    "use strict";

    angular.module('app.supplier_orders').controller('ViewSupplierOrderCtrl', ['$scope', '$state', '$stateParams', 'serverApi', 'funcFactory', function($scope, $state, $stateParams, serverApi, funcFactory){
        var sc = $scope;
        sc.order = {};
        sc.visual = {
            navButtsOptions:[{type:'back', callback:returnBack}, {type:'files', callback:showFileModal}, {type: 'edit', callback: goEditSupplierOrder}, {type:'confirm_order', callback: confirmOrder}, {type:'refresh', callback:refresh}],
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

        function refresh(){
            serverApi.getSupplierOrderDetails($stateParams.id, function(result) {
                console.log(result.data);

                var order = sc.order = result.data;
                sc.amontPercent = funcFactory.getPercent(order.paid_amount, order.total);
                sc.dispatchedPercent = funcFactory.getPercent(order.received_amount, order.total);

                sc.visual.roles = {
                    can_confirm: order.can_confirm
                };
            });
        }

        serverApi.getSupplierOrderDetails($stateParams.id, function(result){
            console.log(result.data);

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