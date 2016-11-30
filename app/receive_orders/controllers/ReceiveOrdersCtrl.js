/**
 * Created by Mikhail Arzhaev on 26.11.15.
 */
(function(){
    'use strict';

    angular.module('app.receive_orders').controller('ReceiveOrdersCtrl', ['$state', '$stateParams', 'serverApi', 'CanCan', 'funcFactory', function($state, $stateParams, serverApi, CanCan, funcFactory){
        var self = this;

        this.visual = {
            navButtsOptions:[
                {
                    type: 'new',
                    callback: function() {
                        self.newOrderData.date = new Date();
                        $('#createNewReceiveOrderModal').modal('show');
                    }
                },
                {
                    type: 'refresh',
                    callback: function() {
                        $state.go('app.receive_orders', {}, {reload:true});
                    }
                }
            ],
            navTableButts:[
                {
                    type: 'view',
                    callback: function(item) {
                        $state.go('app.receive_orders.view', {id:item.data.id || item.data._id});
                    }
                },
                {
                    type: 'remove',
                    callback: function(item) {
                        $.SmartMessageBox({
                            title: "Удалить заказ?",
                            content: "Вы действительно хотите удалить поступление " + item.data.number,
                            buttons: '[Нет][Да]'
                        }, function (ButtonPressed) {
                            if (ButtonPressed === "Да") {
                                serverApi.deleteReceiveOrder(item.data.id, function(result){
                                    if(!result.data.errors){
                                        self.data.ordersList.splice(item.index,1);
                                        funcFactory.showNotification('Поступление ' + item.data.number + ' успешно удалено.', '', true);
                                    }else funcFactory.showNotification('Не удалось удалить поступление ' + item.data.number, result.data.errors);
                                });
                            }
                        });
                    }
                }
            ],
            role:{
                can_edit: CanCan.can('edit', 'ReceiveOrder'),
                can_destroy: CanCan.can('destroy', 'ReceiveOrder')
            },
            titles: ["Поступления"]
        };

        this.data = {ordersList:[], partnersList:[], searchQuery: $stateParams.q};
        this.partnerSelectConfig = {dataMethod: serverApi.getPartners};
        this.newOrderData = {};
        
        this.addNewOrder = function(){
            var data = {
                date: self.newOrderData.date,
                number: self.newOrderData.number,
                vat_code: self.newOrderData.vat_code,
                partner_id: self.newOrderData.partner.id
            };

            serverApi.createReceiveOrder(data, function(result) {
                if(!result.data.errors) {
                    self.data.ordersList.unshift(result.data);
                    funcFactory.showNotification('Поступление успешно создано', '', true);
                    self.clearCreateOrder();
                    $state.go('app.receive_orders.view', {id: result.data.id});
                } else {
                    funcFactory.showNotification('Не удалось создать поступление', result.data.errors);
                }
            });
        };

        this.clearCreateOrder = function(){
            self.newOrderData = {};
        };
    }]);
}());
