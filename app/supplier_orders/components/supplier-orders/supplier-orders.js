class SupplierOrdersCtrl {
    constructor($state, $stateParams, serverApi, funcFactory) {
        let self = this;
        this.$state = $state;
        this.funcFactory = funcFactory;
        this.serverApi = serverApi;

        this.visual = {
            navButtsOptions: [
                {type: 'new', callback: () => $('#createNewOrderModal').modal('show')},
                {
                    type: 'automatically',
                    callback: (subData, button, $event) => {
                        button.disableOnLoad(true, $event);
                        serverApi.automaticallyCreateSupplierOrders(result => {
                            button.disableOnLoad(false, $event);
                            if(!result.data.errors){
                                for(let i = 0; i < result.data.supplier_orders.length; i++) {
                                    self.data.ordersList.unshift(result.data.supplier_orders[i]);
                                }

                                funcFactory.showNotification('Успешно', 'Всё сделал', true);
                            } else {
                                funcFactory.showNotification('Не удалось создать заказы');
                            }
                        }, () => {
                          button.disableOnLoad(false, $event);
                        });
                    }
                },
                {type:'refresh', callback: () => $state.go('app.supplier_orders', {}, {reload:true})}
            ],
            navTableButts: [
                {
                    type:'view',
                    callback: item => $state.go('app.supplier_orders.view', {id: item.data.id || item.data._id})
                },
                {
                    type:'remove',
                    callback: (item, button, $event) => {
                        let data = item.data;

                        $.SmartMessageBox({
                            title: 'Удалить заказ?',
                            content: 'Вы действительно хотите удалить заказ ' + data.number,
                            buttons: '[Нет][Да]'
                        }, ButtonPressed => {
                            if (ButtonPressed === 'Да') {
                                button.disableOnLoad(true, $event);
                                serverApi.deleteSupplierOrder(data.id, result => {
                                    button.disableOnLoad(false, $event);
                                    if(result.data.errors) {
                                        funcFactory.showNotification('Не удалось удалить заказ ' + data.number);
                                    } else {
                                        self.data.ordersList.splice(item.index, 1);
                                        funcFactory.showNotification('Успешно', 'Заказ ' + data.number + ' удален', true);
                                    }
                                }, () => {
                                  button.disableOnLoad(false, $event);
                                });
                            }
                        });
                    }
                }
            ],
            titles: ['Заказы поставщикам']
        };

        this.data = {ordersList: [], searchQuery: $stateParams.q};
        this.partnerSelectConfig = {dataMethod: serverApi.getPartners};
        this.newOrderData = {};
    }

    clearSupplierCreateOrder() {
        this.newOrderData = {};
    }

    addNewSupplierOrder() {
        if(this.newOrderData.partner && this.newOrderData.partner) {
            this.newOrderData.partner_id = this.newOrderData.partner.id;
        }

        delete this.newOrderData.partner;
        let self = this;

        this.serverApi.createSupplierOrder(this.newOrderData, result => {
            if(!result.data.errors){
                self.data.ordersList.unshift(result.data);
                self.funcFactory.showNotification('Заказ успешно добавлен', '', true);
                self.clearSupplierCreateOrder();
                self.$state.go('app.supplier_orders.view', {id: result.data.id});
            } else {
                self.funcFactory.showNotification('Не удалось создать заказ', result.data.errors);
            }
        });
    };
}

SupplierOrdersCtrl.$inject = ['$state', '$stateParams', 'serverApi', 'funcFactory'];

angular.module('app.supplier_orders').component('supplierOrders', {
    controller: SupplierOrdersCtrl,
    controllerAs: '$ctrl',
    templateUrl: '/app/supplier_orders/components/supplier-orders/supplier-orders.html'
});
