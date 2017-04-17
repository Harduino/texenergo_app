class LogsProductCtrl {
    constructor($stateParams, serverApi, $state, funcFactory){
        let self = this;
        this.serverApi = serverApi;

        this.visual = {
            navButtsOptions:[
                {
                    type:'show',
                    callback: () => $state.go('app.product', $stateParams)
                }
            ]
        };

        this.product = {};// данные продукта
        this.partner_logs = [];

        //получаем информацию о продукте при загрузке контроллера $stateParams.id - id продукта
        serverApi.getProduct($stateParams.id, result => self.product = result.data );

        //получаем информацию о продукте при загрузке контроллера $stateParams.id - id продукта
        serverApi.getProductPartnerLogs($stateParams.id, result => self.partner_logs = result.data );
    }

    removePartnerLog(item){
        self.serverApi.deleteProductPartnerLog(self.product.id, item.id, result => {
            if(!result.data.errors){
                for (var i=0; i < self.partner_logs.other_logs.length; i++) {
                    if(self.partner_logs.other_logs[i].id === item.id) {
                        self.partner_logs.other_logs.splice(i,1);
                        break;
                    }
                };
                for (var i=0; i < self.partner_logs.mfk_logs.length; i++) {
                    if(self.partner_logs.mfk_logs[i].id === item.id) {
                        self.partner_logs.mfk_logs.splice(i,1);
                        break;
                    }
                }
                funcFactory.showNotification('Лог удален:', item.human_name, true);
            } else {
                funcFactory.showNotification('Не удалось удалить лог', result.data.errors);
            }
        });
    }
}

LogsProductCtrl.$inject = ['$stateParams', 'serverApi', '$state', 'funcFactory'];
angular.module('app.products').component('logsProduct', {
    controller: LogsProductCtrl,
    controllerAs: 'logsProductCtrl',
    templateUrl: '/app/products/components/logs-product/logs-product.html'
});