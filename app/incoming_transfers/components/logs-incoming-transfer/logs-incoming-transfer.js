class LogsIncomingTransferCtrl {
    constructor($state, $stateParams, serverApi) {
        let self = this;
        this.logs = [];

        this.visual = {
            navButtsOptions:[
                {type: 'back', callback: () => $state.go('app.incoming_transfers',{})},
                {type: 'show', callback: () => $state.go('app.incoming_transfers.view', $stateParams)}
            ],
            chartOptions: {
                barColor:'rgb(103,135,155)',
                scaleColor:false,
                lineWidth:5,
                lineCap:'circle',
                size:50
            }
        };

        serverApi.getIncomingTransferLogs($stateParams.id, result => self.logs = result.data);
    }
}

LogsIncomingTransferCtrl.$inject = ['$state', '$stateParams', 'serverApi'];

angular.module('app.incoming_transfers').component('logsIncomingTransfer', {
    controller: LogsIncomingTransferCtrl,
    controllerAs: 'logsIncomingTransferCtrl',
    templateUrl: '/app/incoming_transfers/components/logs-incoming-transfer/logs-incoming-transfer.html'
});
