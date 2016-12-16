class LogsPartnerCtrl {
    constructor($state, $stateParams, serverApi) {
        let self = this;
        this.logs = {};

        this.visual = {
            navButtsOptions:[
                {type: 'back', callback: () => $state.go('app.partners', {})},
                {type: 'show', callback: () => $state.go('app.partners.view', $stateParams)}
            ],
            chartOptions: {
                barColor: 'rgb(103,135,155)',
                scaleColor: false,
                lineWidth: 5,
                lineCap: 'circle',
                size: 50
            }
        };

        serverApi.getPartnerLogs($stateParams.id, result => self.logs = result.data);
    }
}

LogsPartnerCtrl.$inject = ['$state', '$stateParams', 'serverApi'];

angular.module('app.partners').component('logsPartner', {
    controller: LogsPartnerCtrl,
    controllerAs: 'logsPartnerCtrl',
    templateUrl: '/app/partners/components/logs-partner/logs-partner.html'
});
