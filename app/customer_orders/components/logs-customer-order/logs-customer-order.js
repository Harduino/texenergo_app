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
                    callback: (subData, button, $event) => {
                      button.disableOnLoad(true, $event);
                      serverApi.sendCustomerOrderInvoice($stateParams.id, null, result => {
                          if(result.status == 200) {
                              if(result.data.errors) {
                                  funcFactory.showNotification('Неудача', result.data.errors, true);
                              } else {
                                  funcFactory.showNotification('Успешно', 'Заказ успешно отправлен.', true);
                              }
                          } else {
                              funcFactory.showNotification('Неудача', 'Ошибка при попытке отправить заказ.', true);
                          }
                          button.disableOnLoad(false, $event);
                      }, () => {
                        button.disableOnLoad(false, $event);
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

angular.module('app.customer_orders').component('logsCustomerOrder', {
    controller: LogsCustomerOrderCtrl,
    controllerAs: 'logsCustomerOrderCtrl',
    templateUrl: '/app/customer_orders/components/logs-customer-order/logs-customer-order.html'
});
