class DashboardCtrl {
    constructor(serverApi) {
        let self = this;
        this.data = {customerOrders:[], dispatchOrders:[]};
        this.dataMethods = {parse: serverApi.getParseLogs, search: serverApi.getSearchLogs};

        serverApi.getCustomerOrders(1, '', {}, result => self.data.customerOrders = result.data.slice(0, 10));
        serverApi.getDispatchOrders(1, '', {}, result => self.data.dispatchOrders = result.data.slice(0, 10));
    }
}

DashboardCtrl.$inject = ['serverApi'];

angular.module('app.dashboard').component('dashboard', {
    controller: DashboardCtrl,
    controllerAs: '$ctrl',
    templateUrl: '/app/dashboard/components/dashboard/dashboard.html'
});
