class LogsReceiveOrderCtrl {
    constructor($state, $stateParams, serverApi, funcFactory){
        let self = this;
        this.funcFactory = funcFactory;
        this.serverApi = serverApi;
        this.logs = {};

        this.visual = {
            navButtsOptions:[
                {
                    type: 'back',
                    callback: () => $state.go('app.receive_orders', {})
                },
                {
                    type: 'show',
                    callback: () => $state.go('app.receive_orders.view', $stateParams)
                }
            ],
            chartOptions: {
                barColor:'rgb(103,135,155)',
                scaleColor:false,
                lineWidth:5,
                lineCap:'circle',
                size:50
            }
        };

        serverApi.getReceiveOrderLogs($stateParams.id, result => self.logs = result.data);

    };
};

LogsReceiveOrderCtrl.$inject = ['$state', '$stateParams', 'serverApi', 'funcFactory'];
angular.module('app.receive_orders').controller('LogsReceiveOrderCtrl', LogsReceiveOrderCtrl);
