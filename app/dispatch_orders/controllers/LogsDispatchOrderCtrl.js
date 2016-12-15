class LogsDispatchOrderCtrl {
    constructor($state, $stateParams, serverApi) {
        let self = this;
        this.logs = [];

        this.visual = {
            navButtsOptions:[
                {type: 'back', callback: () => $state.go('app.dispatch_orders', {})},
                {type: 'show', callback: () => $state.go('app.dispatch_orders.view', $stateParams)}
            ],
            chartOptions: {
                barColor: 'rgb(103,135,155)',
                scaleColor: false,
                lineWidth: 5,
                lineCap: 'circle',
                size: 50
            }
        };

        serverApi.getDispatchOrderLogs($stateParams.id, result => self.logs = result.data);
    }
}

LogsDispatchOrderCtrl.$inject = ['$state', '$stateParams', 'serverApi'];
angular.module('app.dispatch_orders').controller('LogsDispatchOrderCtrl', LogsDispatchOrderCtrl);
