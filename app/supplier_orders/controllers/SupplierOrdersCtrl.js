/**
 * Created by Mikhail Arzhaev on 19.11.15.
 */
(function(){

    'use strict';

    angular.module('app.supplier_orders').controller('SupplierOrdersCtrl', ['$scope', '$state', '$stateParams', 'serverApi', '$filter', 'CanCan', 'funcFactory', function($scope, $state, $stateParams, serverApi, $filter, CanCan, funcFactory){
        var sc = $scope;

        sc.visual = {
            navButtsOptions:[{type: 'new', callback: createNewSupplierOrder}, {type: 'automatically', callback: createAutomatically}, {type:'refresh', callback:refresh}],
            navTableButts:[{type:'view', callback:viewOrder}, {type:'table_edit', callback:editOrder}, {type:'remove', callback:removeOrder}],
            canAddPartner: CanCan.can('see_multiple', 'Partner'),
            titles:[window.gon.index.SupplierOrder.indexTitle]
        };
        sc.data = {
            ordersList:[],
            searchQuery:$stateParams.q
        };
        sc.newOrderData = {
            date: null
        };

        function refresh(){
            $state.go('app.supplier_orders', {}, {reload:true});
        }

        function viewOrder(item){
            $state.go('app.supplier_orders.view', {id: item.data.id || item.data._id});
        }
        
        function editOrder(item){
            $state.go('app.supplier_orders.view.edit', {id:item.data.id || item.data._id});
        }

        function createNewSupplierOrder(){
            sc.newOrderData.date = $filter('date')(new Date, 'dd.MM.yyyy HH:mm');
            $('#createNewOrderModal').modal('show');
        }
        
        function createAutomatically(){
            serverApi.automaticallyCreateSupplierOrders(function(result){
//                debugger;
                if(!result.data.errors){
                    for(var i=0; i < result.data.supplier_orders.length; i++){
                        sc.data.ordersList.unshift(result.data.supplier_orders[i]);
                    }
                    funcFactory.showNotification('Успешно', 'Всё сделал', true);
                } else {
                    funcFactory.showNotification('Не удалось создать заказы');
                }
            });
        }

        function removeOrder(item){
            var data = item.data;
            $.SmartMessageBox({
                title: "Удалить заказ?",
                content: "Вы действительно хотите удалить заказ " + data.number,
                buttons: '[Нет][Да]'
            }, function (ButtonPressed) {
                if (ButtonPressed === "Да") {
                    serverApi.deleteSupplierOrder(data.id, function(result){
                        if(!result.data.errors){
                            console.log(result);
                            sc.data.ordersList.splice(item.index, 1);
                            funcFactory.showNotification('Успешно', 'Заказ ' + data.number + ' удален', true);
                        } else funcFactory.showNotification('Не удалось удалить заказ ' + data.number);
                    });
                }
            });
        }
    }]);
}());