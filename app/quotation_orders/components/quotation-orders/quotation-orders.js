class QuotationOrdersCtrl {
    constructor($state, $stateParams, serverApi, funcFactory) {
        let self = this;

        this.$state = $state;
        this.serverApi = serverApi;
        this.funcFactory = funcFactory;
        this.funcFactory.setPageTitle('Рассчёты');

        this.visual = {
            navButtsOptions:[
                {
                    type: 'new',
                    callback: () => {
                        self.newOrderData.date = new Date();
                        $('#createNewQuotationOrderModal').modal('show');
                    }
                },
                {
                    type: 'refresh',
                    callback: () => $state.go('app.quotation_orders', {}, {reload:true})
                }
            ],
            navTableButts:[
                {
                    type: 'view',
                    callback: item => $state.go('app.quotation_orders.view', {id: item.data.id || item.data._id})
                },
                {
                    type: 'remove',
                    callback: (item, button, $event) => {
                        $.SmartMessageBox({
                            title: 'Удалить рассчёт?',
                            content: 'Вы действительно хотите удалить рассчёт ' + item.data.number,
                            buttons: '[Нет][Да]'
                        }, ButtonPressed => {
                            if (ButtonPressed === 'Да') {
                                button.disableOnLoad(true, $event);
                                serverApi.deleteQuotationOrder(item.data.id, result => {
                                    button.disableOnLoad(false, $event);
                                    if(!result.data.errors){
                                        self.data.ordersList.splice(item.index,1);
                                        funcFactory.showNotification('Поступление ' + item.data.number +
                                            ' успешно удалено.', '', true);
                                    } else {
                                        funcFactory.showNotification('Не удалось удалить поступление ' +
                                            item.data.number, result.data.errors);
                                    }
                                }, () => {
                                  button.disableOnLoad(false, $event);
                                });
                            }
                        });
                    }
                }
            ],
            titles: ['Поступления']
        };

        this.data = {ordersList: [], searchQuery: $stateParams.q};
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

        this.serverApi.createQuotationOrder(data, result => {
            if(!result.data.errors) {
                self.data.ordersList.unshift(result.data);
                self.funcFactory.showNotification('Рассчёт успешно создан', '', true);
                self.clearCreateOrder();
                self.$state.go('app.quotation_orders.view', {id: result.data.id});
            } else {
                self.funcFactory.showNotification('Не удалось создать рассчёт', result.data.errors);
            }
        });
    }

    clearCreateOrder() {
        this.newOrderData = {};
    }
}

QuotationOrdersCtrl.$inject = ['$state', '$stateParams', 'serverApi', 'funcFactory'];

angular.module('app.quotation_orders').component('quotationOrders', {
    controller: QuotationOrdersCtrl,
    controllerAs: '$ctrl',
    templateUrl: '/app/quotation_orders/components/quotation-orders/quotation-orders.html'
});