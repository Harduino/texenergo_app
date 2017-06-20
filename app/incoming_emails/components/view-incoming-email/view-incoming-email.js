class ViewIncomingEmailCtrl {
    constructor($state, $stateParams, serverApi, $q, funcFactory) {
        let self = this;
        this.funcFactory = funcFactory;
        this.serverApi = serverApi;
        this.incomingEmail = {};

        this.visual = {
            navButtsOptions:[
                {type: 'back', callback: () => $state.go('app.incoming_emails', {})},
                {
                    type: 'refresh',
                    callback: (subData, button, $event) => {
                        button.disableOnLoad(true, $event);
                        serverApi.getIncomingEmailDetails($stateParams.id, res => {
                            button.disableOnLoad(false, $event);
                            self.incomingEmail = res.data;
                        }, () => {
                          button.disableOnLoad(false, $event);
                        });
                    }
                }
            ],
            chartOptions: {
                barColor: 'rgb(103,135,155)',
                scaleColor: false,
                lineWidth: 5,
                lineCap: 'circle',
                size: 50
            },
            showFileModal: angular.noop,
            titles: 'Входящее письмо'
        };

        serverApi.getIncomingEmailDetails($stateParams.id, result => {
            let email = self.incomingEmail = result.data;
        });
    }
}

ViewIncomingEmailCtrl.$inject = ['$state', '$stateParams', 'serverApi', '$q', 'funcFactory'];

angular.module('app.incoming_emails').component('viewIncomingEmail', {
    controller: ViewIncomingEmailCtrl,
    controllerAs: '$ctrl',
    templateUrl: '/app/incoming_emails/components/view-incoming-email/view-incoming-email.html'
});
