class LogsProductCtrl {
    constructor($state, $stateParams) {
    }
}

LogsProductCtrl.$inject = ['$state', '$stateParams'];

angular.module('app.products').component('logsProduct', {
    controller: LogsProductCtrl,
    controllerAs: 'logsProductCtrl',
    templateUrl: '/app/products/components/logs-product/logs-product.html'
});
