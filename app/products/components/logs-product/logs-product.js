class LogsProductCtrl {
    constructor($state, $stateParams, funcFactory, serverApi) {
        let self = this;
        this.funcFactory = funcFactory;
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

    removePartnerLog(log) {
        let self = this;

        this.serverApi.deleteProductPartnerLog(this.product.id, log.id, result => {
            if(!result.data.errors) {
                self.removeLogType(log, 'other_logs');
                self.removeLogType(log, 'mfk_logs');
                self.funcFactory.showNotification('Лог удален:', log.human_name, true);
            } else {
                self.funcFactory.showNotification('Не удалось удалить лог', result.data.errors);
            }
        });
    }

    removeLogType(log, storageType) {
        for (let logIndex = 0; logIndex < this.partner_logs[storageType].length; logIndex++) {
            if (this.partner_logs[storageType][logIndex].id === log.id) {
                this.partner_logs[storageType].splice(logIndex, 1);
                break;
            }
        }
    }
}

LogsProductCtrl.$inject = ['$state', '$stateParams', 'funcFactory', 'serverApi'];

angular.module('app.products').component('logsProduct', {
    controller: LogsProductCtrl,
    controllerAs: 'logsProductCtrl',
    templateUrl: '/app/products/components/logs-product/logs-product.html'
});
