class DispatchOrdersCtrl {
    constructor($state, $stateParams, serverApi, funcFactory) {
        let self = this
        this.serverApi = serverApi;
        this.funcFactory = funcFactory;
        this.data = {ordersList:[], searchQuery: $stateParams.q, dispatchableProducts: []};

        this.visual = {
            navButtsOptions:[
                {type: 'refresh', callback: () => $state.go('app.dispatch_orders', {}, {reload:true})}
            ],
            navTableButts: [
                {
                    type: 'view',
                    callback: (item) => $state.go('app.dispatch_orders.view', {id: item.data.id})
                },
                {
                    type: 'remove',
                    callback: item => {
                        $.SmartMessageBox({
                            title: 'Удалить списание?',
                            content: 'Вы действительно хотите удалить списание ' + item.data.number,
                            buttons: '[Нет][Да]'
                        }, ButtonPressed => {
                            if (ButtonPressed === 'Да') {
                                serverApi.deleteDispatchOrder(item.data.id, result => {
                                    if(!result.data.errors){
                                        self.data.ordersList.splice(item.index,1);
                                        funcFactory.showNotification('Списание ' + item.data.number +
                                            ' успешно удалено.', '', true);
                                    } else {
                                        funcFactory.showNotification('Не удалось удалить списание ' +
                                            item.data.number, result.data.errors);
                                    }
                                });
                            }
                        });
                    }
                }
            ],
            titles: ['Списания']
        };
        serverApi.getDispatchableProducts(r => self.data.dispatchableProducts = r.data);
    }

    fetchAddableOrder(item) {
        let self = this;
        for (var i = 0; i < self.data.ordersList.length; i++) {
            var x = self.data.ordersList[i];
            if(x.partner.id === item.partner.id && x.can_edit) return x;
        }
    }

    addDispatchOrderContent(item, dispatch_order) {
        let self = this;
        let data = {
            customer_order_content_id: item.customer_order_content_id,
            quantity: item.remains_to_dispatch,
            customer_order_id: item.customer_order_id
        };
        self.serverApi.createDispatchOrderContent(dispatch_order.id, data, r => {
            if (!!r.data && !r.data.errors) {
                self.funcFactory.showNotification("Позиция списана", "Позиция добавлена в реализацию " + dispatch_order.number, true);
                for (var i = self.data.dispatchableProducts.length - 1; i >= 0; i--) {
                    if(self.data.dispatchableProducts[i].customer_order_content_id === item.customer_order_content_id) self.data.dispatchableProducts.splice(i, 1);
                }
            } else {
                self.funcFactory.showNotification("Не смог списать", "Сервер ответил " + r.data.errors);
            }
        });
    }

    dispatchItem(item) {
        let self = this;
        let currentOrder = self.fetchAddableOrder(item);
        let data = {
            partner_id: item.partner.id,
            // customer_order_id: item.customer_order_id
            delivery_address: item.delivery_address,
            transportation: item.transportation
        }
        if (currentOrder === undefined) {
            self.serverApi.createDispatchOrder(data, r => {
                self.data.ordersList.unshift(r.data);
                currentOrder = self.fetchAddableOrder(item);
                if(currentOrder !== undefined){
                    self.funcFactory.showNotification("Содание реализации", "Создан новый документ реализации " + currentOrder.number, true);
                    self.addDispatchOrderContent(item, currentOrder);
                } else {
                    self.funcFactory.showNotification("Нет списания", "Не смог ни найти, ни создать новый документ реализации. ", false)
                }
            })
        } else self.addDispatchOrderContent(item, currentOrder);
    }

    disallowAutomatic(item) {
        let self = this;
        let data = { automatically_dispatchable: false };
        self.serverApi.updateCustomerOrderProduct(item.customer_order_id, item.customer_order_content_id, data, r => {
            if(!r.data.errors) {
                item.automatically_dispatchable = false;
                self.funcFactory.showNotification("Получилось", "Позиция НЕ будет обрабатываться роботом.", true);
            } else {
                self.funcFactory.showNotification("Не получилось", "Не получилось поставить отметку о разрешении списания роботом. " + r.data.errors, false);
            }
        })
    }

    allowAutomatic(item) {
        let self = this;
        let data = { automatically_dispatchable: true };
        self.serverApi.updateCustomerOrderProduct(item.customer_order_id, item.customer_order_content_id, data, r => {
            if(!r.data.errors){
                item.automatically_dispatchable = true;
                self.funcFactory.showNotification("Получилось", "Позиция будет списана роботом автоматически.", true);
            } else {
                self.funcFactory.showNotification("Не получилось", "Не получилось снять отметку о запрете списания роботом. " + r.data.errors, false);
            }
        })
    }
}

DispatchOrdersCtrl.$inject = ['$state', '$stateParams', 'serverApi', 'funcFactory'];

angular.module('app.dispatch_orders').component('dispatchOrders', {
    controller: DispatchOrdersCtrl,
    controllerAs: 'dispatchOrdersCtrl',
    templateUrl: '/app/dispatch_orders/components/dispatch-orders/dispatch-orders.html'
});
