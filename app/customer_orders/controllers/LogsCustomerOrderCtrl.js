class LogsCustomerOrderCtrl {
    constructor($state, $stateParams, serverApi, funcFactory) {
        let self = this;
        this.logs = {};

        this.visual = {
            navButtsOptions:[
                {type: 'back', callback: () => $state.go('app.customer_orders', {})},
                {type: 'files'},
                {
                    type: 'send_email',
                    callback: () => {
                        serverApi.sendCustomerOrderInvoice($stateParams.id, result => {
                            if(result.status == 200) {
                                if(result.data.errors) {
                                    funcFactory.showNotification('Неудача', result.data.errors, true);
                                } else {
                                    funcFactory.showNotification('Успешно', 'Заказ успешно отправлен.', true);
                                }
                            } else {
                                funcFactory.showNotification('Неудача', 'Ошибка при попытке отправить заказ.', true);
                            }
                        });
                    }
                },
                {type: 'recalculate'},
                {type: 'confirm_order'},
                {type: 'show', callback: () => $state.go('app.customer_orders.view', $stateParams)}
            ],
            chartOptions: {
                barColor: 'rgb(103,135,155)',
                scaleColor: false,
                lineWidth: 5,
                lineCap: 'circle',
                size: 50
            }
        };

        serverApi.getCustomerOrderLogs($stateParams.id, result => self.logs = result.data);
    }
}

LogsCustomerOrderCtrl.$inject = ['$state', '$stateParams', 'serverApi', 'funcFactory'];
angular.module('app.customer_orders').controller('LogsCustomerOrderCtrl', LogsCustomerOrderCtrl);
