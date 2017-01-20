class DispatchOrdersCtrl {
    constructor($state, $stateParams, serverApi) {
        let self = this
        this.serverApi = serverApi;
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
            // Remove the item from dispatchableProducts
            for (var i = self.data.dispatchableProducts.length - 1; i >= 0; i--) {
                if(self.data.dispatchableProducts.customer_order_content_id === item.customer_order_content_id) self.data.dispatchableProducts.splice(i, 1);
            }
        });
    }

    dispatchItem(item) {
        let self = this;
        let currentOrder = self.fetchAddableOrder(item);

        // Create a new one if none is founc
        if (currentOrder === undefined) {
            // Handle exception here
            self.serverApi.createDispatchOrder({partner_id: item.partner.id}, r => {
                self.data.ordersList.unshift(r.data);
                currentOrder = self.fetchAddableOrder(item);
                // Notify if exception
                if(currentOrder !== undefined) self.addDispatchOrderContent(item, currentOrder);
            })
        } else self.addDispatchOrderContent(item, currentOrder);
    }

    disallowAutomatic(item) {
        let self = this;
        let data = { prevent_robot: true };
        self.serverApi.updateCustomerOrderProduct(item.customer_order_id, item.customer_order_content_id, data, r => {
            if(!r.data.errors) item.prevent_robot = true;
        })
    }

    allowAutomatic(item) {
        let self = this;
        let data = { prevent_robot: false };
        self.serverApi.updateCustomerOrderProduct(item.customer_order_id, item.customer_order_content_id, data, r => {
            if(!r.data.errors) item.prevent_robot = false;
        })
    }
}

DispatchOrdersCtrl.$inject = ['$state', '$stateParams', 'serverApi'];

angular.module('app.dispatch_orders').component('dispatchOrders', {
    controller: DispatchOrdersCtrl,
    controllerAs: 'dispatchOrdersCtrl',
    templateUrl: '/app/dispatch_orders/components/dispatch-orders/dispatch-orders.html'
});
