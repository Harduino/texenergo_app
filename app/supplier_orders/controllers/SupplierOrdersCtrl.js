/**
 * Created by Mikhail Arzhaev on 19.11.15.
 */
(function(){
    'use strict';

    angular.module('app.supplier_orders').controller('SupplierOrdersCtrl', ['$state', '$stateParams', 'serverApi', '$filter', 'CanCan', 'funcFactory', function($state, $stateParams, serverApi, $filter, CanCan, funcFactory){
        var self = this;

        this.visual = {
            navButtsOptions: [
                {
                    type: 'new',
                    callback: function() {
                        $('#createNewOrderModal').modal('show');
                    }
                },
                {
                    type: 'automatically',
                    callback: function() {
                        serverApi.automaticallyCreateSupplierOrders(function(result){
                            if(!result.data.errors){
                                for(var i = 0; i < result.data.supplier_orders.length; i++) {
                                    self.data.ordersList.unshift(result.data.supplier_orders[i]);
                                }

                                funcFactory.showNotification('Успешно', 'Всё сделал', true);
                            } else {
                                funcFactory.showNotification('Не удалось создать заказы');
                            }
                        });
                    }
                },
                {
                    type:'refresh',
                    callback: function() {
                        $state.go('app.supplier_orders', {}, {reload:true});
                    }
                }
            ],
            navTableButts: [
                {
                    type:'view',
                    callback: function(item) {
                        $state.go('app.supplier_orders.view', {id: item.data.id || item.data._id});
                    }
                },
                {
                    type:'remove',
                    callback: function(item) {
                        var data = item.data;

                        $.SmartMessageBox({
                            title: "Удалить заказ?",
                            content: "Вы действительно хотите удалить заказ " + data.number,
                            buttons: '[Нет][Да]'
                        }, function (ButtonPressed) {
                            if (ButtonPressed === "Да") {
                                serverApi.deleteSupplierOrder(data.id, function(result){
                                    if(result.data.errors) {
                                        funcFactory.showNotification('Не удалось удалить заказ ' + data.number);
                                    } else {
                                        self.data.ordersList.splice(item.index, 1);
                                        funcFactory.showNotification('Успешно', 'Заказ ' + data.number + ' удален', true);
                                    }
                                });
                            }
                        });
                    }
                }
            ],
            canAddPartner: CanCan.can('see_multiple', 'Partner'),
            titles: ["Заказы поставщикам"]
        };

        this.data = {ordersList: [], searchQuery: $stateParams.q, partnersList: []};
        this.partnerSelectConfig = {dataMethod: serverApi.getPartners};
        this.newOrderData = {};

        this.clearSupplierCreateOrder = function() {
            self.newOrderData = {};
        };

        this.addNewSupplierOrder = function(){
            if(self.newOrderData.partner && self.newOrderData.partner) {
                self.newOrderData.partner_id = self.newOrderData.partner.id;
            }
            delete self.newOrderData.partner;

            serverApi.createSupplierOrder(self.newOrderData, function(result){
                if(!result.data.errors){
                    self.data.ordersList.unshift(result.data);
                    funcFactory.showNotification('Заказ успешно добавлен', '', true);
                    self.clearSupplierCreateOrder();
                    $state.go('app.supplier_orders.view', {id: result.data.id});
                } else {
                    funcFactory.showNotification('Не удалось создать заказ', result.data.errors);
                }
            });
        };
    }]);
}());
