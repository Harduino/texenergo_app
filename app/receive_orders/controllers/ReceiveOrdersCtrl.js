/**
 * Created by Mikhail Arzhaev on 26.11.15.
 */
(function(){

    'use strict';

    angular.module('app.receive_orders').controller('ReceiveOrdersCtrl', ['$scope', '$state', '$stateParams', 'serverApi', 'CanCan', 'funcFactory', function($scope, $state, $stateParams, serverApi, CanCan, funcFactory){
        var sc = $scope;

        sc.visual = {
            navButtsOptions:[{ type: 'new', callback: createNewOrder }, {type:'refresh', callback:refresh}],
            navTableButts:[{type:'view', callback:viewReceiveOrder}, {type:'table_edit', callback:editReceiveOrder}, {type:'remove', callback:deleteReceiveOrder}],
            role:{
                can_edit: CanCan.can('edit', 'ReceiveOrder'),
                can_destroy: CanCan.can('destroy', 'ReceiveOrder')
            },
            titles: [window.gon.index.ReceiveOrder.indexTitle]
        };

        sc.data = {
            ordersList:[],
            partnersList:[],
            searchQuery:$stateParams.q
        };
        
        sc.partnerSelectConfig ={
            dataMethod: serverApi.getPartners
        };
        
        sc.newOrderData = {};

        function refresh(){
            $state.go('app.receive_orders', {}, {reload:true});
        }

        function createNewOrder(){
            sc.newOrderData.date = new Date();
            $('#createNewReceiveOrderModal').modal('show');
        }
        
        sc.addNewOrder = function(){
            var data = {
                date: sc.newOrderData.date,
                number: sc.newOrderData.number,
                vat_code: sc.newOrderData.vat_code,
                partner_id: sc.newOrderData.partner.id
            };
            serverApi.createReceiveOrder(data, function(result){
                if(!result.data.errors){
                    sc.data.ordersList.unshift(result.data);
                    funcFactory.showNotification('Поступление успешно создано', '', true);
                    sc.clearCreateOrder();
                    $state.go('app.receive_orders.view', {id: result.data.id});
                } else {
                    funcFactory.showNotification('Не удалось создать поступление', result.data.errors);
                };
            });
        };

        sc.clearCreateOrder = function(){
            sc.newOrderData = {};
        };

        function viewReceiveOrder(item){
           $state.go('app.receive_orders.view', {id:item.data.id || item.data._id});
        }
        function editReceiveOrder(item){
           $state.go('app.receive_orders.view.edit', {id:item.data.id || item.data._id});
        }
        function deleteReceiveOrder(item){
            $.SmartMessageBox({
                title: "Удалить заказ?",
                content: "Вы действительно хотите удалить поступление " + item.data.number,
                buttons: '[Нет][Да]'
            }, function (ButtonPressed) {
                if (ButtonPressed === "Да") {
                    serverApi.deleteReceiveOrder(item.data.id, function(result){
                        if(!result.data.errors){
                            sc.data.ordersList.splice(item.index,1);
                            funcFactory.showNotification('Поступление ' + item.data.number + ' успешно удалено.', '', true);
                        }else funcFactory.showNotification('Не удалось удалить поступление ' + item.data.number, result.data.errors);
                    });
                }
            });
        }
    }]);
}());
