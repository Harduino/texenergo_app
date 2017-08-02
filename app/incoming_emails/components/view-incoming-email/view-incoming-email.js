class ViewIncomingEmailCtrl {
    constructor($state, $stateParams, serverApi, $q, funcFactory) {
        let self = this;
        this.funcFactory = funcFactory;
        this.serverApi = serverApi;
        this.incomingEmail = {};
        this.response = "";
        this.responseSender = null;

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
            let d = result.data;

            d.internalEmail = angular.isObject(d.from);
            self.incomingEmail = d;

            self.funcFactory.setPageTitle("Письмо от " +
            (d.internalEmail ? d.from.email : d.from));
        });
        self.funcFactory.setPageTitle("Входящее письмо");
    }

    sendResponse () {
        let self = this;
        let postData = { html: self.response, sender: (self.responseSender === null ? null : self.responseSender.name) };
        self.serverApi.createIncomingEmailResponse(self.incomingEmail.id, postData, result => {
            if(result.status == 200 && !result.data.errors) {
                self.funcFactory.showNotification('Успешно', 'Ответил.', true);
                self.response = "";
            } else {
                self.funcFactory.showNotification('Неудача', 'Не удалось ответить', true);
            }
        });
    }

    saveIncomingEmail () {
        let self = this;
        let postData = { incoming_email: { accomplished: self.incomingEmail.accomplished, comment: self.incomingEmail.comment } };
        self.serverApi.updateIncomingEmail(self.incomingEmail.id, postData, result => {
            if(result.status == 200 && !result.data.errors) {
                self.funcFactory.showNotification('Успешно', 'Обновил.', true);
            } else {
                self.funcFactory.showNotification('Неудача', 'Не удалось обновить', true);
            }
        });
    }
}

ViewIncomingEmailCtrl.$inject = ['$state', '$stateParams', 'serverApi', '$q', 'funcFactory'];

angular.module('app.incoming_emails').component('viewIncomingEmail', {
    controller: ViewIncomingEmailCtrl,
    controllerAs: '$ctrl',
    templateUrl: '/app/incoming_emails/components/view-incoming-email/view-incoming-email.html'
});
