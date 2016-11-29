/**
 * Created by Egor Lobanov on 07.11.15.
 */
(function(){

    'use strict';

    angular.module('app.customer_orders').controller('CustomerOrdersCtrl', ['$state', '$stateParams', 'serverApi', 'CanCan', 'funcFactory', 'authService', function($state, $stateParams, serverApi, CanCan, funcFactory, authService){
        var self = this;

        this.visual = {
            navButtsOptions: [
                {
                    type: 'new',
                    callback: function() {
                        self.newOrderData.date = new Date();
                        self.newOrderData.partner = authService.profile.user_metadata.partner || null;
                        $('#createNewOrderModal').modal('show');
                    }
                },
                {
                    type: 'refresh',
                    callback: function() {
                        $state.go('app.customer_orders', {}, {reload: true});
                    }
                }
            ],
            navTableButts:[
                {
                    type:'view',
                    callback: function(item) {
                        $state.go('app.customer_orders.view', {id:item.data.id || item.data._id});
                    }
                },
                {
                    type:'remove',
                    callback: function(item) {
                        $.SmartMessageBox({
                            title: 'Удалить заказ?',
                            content: 'Вы действительно хотите удалить заказ ' + item.data.number,
                            buttons: '[Нет][Да]'
                        }, function (ButtonPressed) {
                            if (ButtonPressed === 'Да') {
                                serverApi.deleteCustomerOrder(item.data.id, function(result){
                                    if(!result.data.errors){
                                        self.data.ordersList.splice(item.index,1);
                                        funcFactory.showNotification('Заказ ' + item.data.number + ' успешно удален.',
                                            '', true);
                                    } else {
                                        funcFactory.showNotification('Не удалось удалить заказ ' + item.data.number,
                                            result.data.errors);
                                    }
                                });
                            }
                        });
                    }
                }
            ],
            titles: ['Заказы клиентов']
        };

        this.data = {ordersList:[], partnersList:[], searchQuery:$stateParams.q};
        this.partnerSelectConfig = {dataMethod: serverApi.getPartners};

        this.addNewOrder = function() {
            if(self.newOrderData.partner && self.newOrderData.partner) {
                self.newOrderData.partner_id = self.newOrderData.partner.id;
            }

            delete self.newOrderData.date;// delete forbidden property
            delete self.newOrderData.partner;

            serverApi.createCustomerOrder(self.newOrderData, function(result){
                if(!result.data.errors) {
                    self.data.ordersList.unshift(result.data);
                    funcFactory.showNotification('Заказ успешно добавлен', '', true);
                    self.clearCreateOrder();
                    $state.go('app.customer_orders.view', {id: result.data.id});
                } else {
                    funcFactory.showNotification('Не удалось создать заказ', result.data.errors);
                }
            });
        };

        this.clearCreateOrder = function(){
            self.newOrderData = {date: null, title:'', description:'', partner_id: '', request_original:''};
        };

        this.clearCreateOrder();
    }]);
}());