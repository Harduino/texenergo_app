class DashboardCtrl {
    constructor(serverApi) {
        let self = this;
        this.data = {customerOrders:[], dispatchOrders:[]};

        this.searchLogScrlCnfg = {dataMethod: serverApi.getSearchLogs, resultCollection: [], setQueryValue: angular.noop};
        this.parseLogScrlCnfg = {dataMethod: serverApi.getParseLogs, resultCollection: [], setQueryValue: angular.noop};

        serverApi.getCustomerOrders(1, '', {}, result => self.data.customerOrders = result.data.slice(0, 10));
        serverApi.getDispatchOrders(1, '', {}, result => self.data.dispatchOrders = result.data.slice(0, 10));
    }
}

DashboardCtrl.$inject = ['serverApi'];

angular.module('app.dashboard').component('dashboard', {
    controller: DashboardCtrl,
    controllerAs: 'dashboardCtrl',
    templateUrl: '/app/dashboard/components/dashboard/dashboard.html'
});
