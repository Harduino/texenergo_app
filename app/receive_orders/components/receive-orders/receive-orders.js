class ReceiveOrdersCtrl {
    constructor($state, $stateParams, serverApi, CanCan, funcFactory) {
        let self = this;

        this.$state = $state;
        this.serverApi = serverApi;
        this.funcFactory = funcFactory;

        this.visual = {
            navButtsOptions:[
                {
                    type: 'new',
                    callback: () => {
                        self.newOrderData.date = new Date();
                        $('#createNewReceiveOrderModal').modal('show');
                    }
                },
                {
                    type: 'refresh',
                    callback: () => $state.go('app.receive_orders', {}, {reload:true})
                }
            ],
            navTableButts:[
                {
                    type: 'view',
                    callback: item => $state.go('app.receive_orders.view', {id: item.data.id || item.data._id})
                },
                {
                    type: 'remove',
                    callback: item => {
                        $.SmartMessageBox({
                            title: 'Удалить заказ?',
                            content: 'Вы действительно хотите удалить поступление ' + item.data.number,
                            buttons: '[Нет][Да]'
                        }, ButtonPressed => {
                            if (ButtonPressed === 'Да') {
                                serverApi.deleteReceiveOrder(item.data.id, result => {
                                    if(!result.data.errors){
                                        self.data.ordersList.splice(item.index,1);
                                        funcFactory.showNotification('Поступление ' + item.data.number +
                                            ' успешно удалено.', '', true);
                                    } else {
                                        funcFactory.showNotification('Не удалось удалить поступление ' +
                                            item.data.number, result.data.errors);
                                    }
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
            titles: ['Поступления']
        };

        this.data = {ordersList:[], partnersList:[], searchQuery: $stateParams.q};
        this.partnerSelectConfig = {dataMethod: serverApi.getPartners};
        this.newOrderData = {};
    }

    addNewOrder() {
        let data = {
            date: this.newOrderData.date,
            number: this.newOrderData.number,
            vat_code: this.newOrderData.vat_code,
            partner_id: this.newOrderData.partner.id
        };

        let self = this;

        this.serverApi.createReceiveOrder(data, result => {
            if(!result.data.errors) {
                self.data.ordersList.unshift(result.data);
                self.funcFactory.showNotification('Поступление успешно создано', '', true);
                self.clearCreateOrder();
                self.$state.go('app.receive_orders.view', {id: result.data.id});
            } else {
                self.funcFactory.showNotification('Не удалось создать поступление', result.data.errors);
            }
        });
    }

    clearCreateOrder() {
        this.newOrderData = {};
    }
}

ReceiveOrdersCtrl.$inject = ['$state', '$stateParams', 'serverApi', 'CanCan', 'funcFactory'];

angular.module('app.receive_orders').component('receiveOrders', {
    controller: ReceiveOrdersCtrl,
    controllerAs: 'receiveOrdersCtrl',
    templateUrl: '/app/receive_orders/components/receive-orders/receive-orders.html'
});
