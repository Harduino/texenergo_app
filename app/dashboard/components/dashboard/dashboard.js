class DashboardCtrl {
    constructor(serverApi, Observer) {
        let self = this;
        this.data = {customerOrders:[], dispatchOrders:[]};

        this.searchLogScrlCnfg = {dataMethod: serverApi.getSearchLogs, resultCollection: [], setQueryValue: angular.noop};
        this.parseLogScrlCnfg = {dataMethod: serverApi.getParseLogs, resultCollection: [], setQueryValue: angular.noop};

        serverApi.getCustomerOrders(1, '', {}, result => self.data.customerOrders = result.data.slice(0, 10));
        serverApi.getDispatchOrders(1, '', {}, result => self.data.dispatchOrders = result.data.slice(0, 10));

        Observer.subscribe('FILTER_LIST', filterData => {
            if(['parse', 'search'].indexOf(filterData.listId) !== -1) {
                self[filterData.listId + 'LogScrlCnfg'].setQueryValue(filterData.filter);
            }
        });
    }
}

DashboardCtrl.$inject = ['serverApi', 'Observer'];

angular.module('app.dashboard').component('dashboard', {
    controller: DashboardCtrl,
    controllerAs: 'dashboardCtrl',
    templateUrl: '/app/dashboard/components/dashboard/dashboard.html'
});
