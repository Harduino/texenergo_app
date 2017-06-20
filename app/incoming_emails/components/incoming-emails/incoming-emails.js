class IncomingEmailsCtrl {
    constructor($state, $stateParams, serverApi, funcFactory) {
        let self = this;

        this.visual = {
            navButtsOptions:[
                {type: 'refresh', callback: () => $state.go('app.incoming_emails', {}, {reload: true})}
            ],
            navTableButts:[
                {
                    type: 'view',
                    callback: item => $state.go('app.incoming_emails.view', { id: item.data.id })
                },
                {
                    type: 'remove',
                    callback: (item, button, $event) => {
                        $.SmartMessageBox({
                            title: 'Удалить входящее письмо?',
                            content: 'Вы действительно хотите удалить входящее письма ' + item.data.number,
                            buttons: '[Нет][Да]'
                        }, ButtonPressed => {
                            if (ButtonPressed === 'Да') {
                                button.disableOnLoad(true, $event);

                                serverApi.deleteIncomingEmail(item.data.id, result => {
                                    if(!result.data.errors) {
                                        self.data.incomingEmailsList.splice(item.index, 1);
                                        funcFactory.showNotification('Письмо от ' + item.data.from + ' успешно удалено.',
                                            '', true);
                                    } else {
                                        funcFactory.showNotification('Не удалось удалить письмо ' + item.data.from,
                                            result.data.errors);
                                    }

                                    button.disableOnLoad(false, $event);
                                }, () => {
                                  button.disableOnLoad(false, $event);
                                });
                            }
                        });
                    }
                }
            ],
            titles: ['Входящие письма']
        };

        this.data = { incomingEmailsList:[], searchQuery: $stateParams.q };
    }
}

IncomingEmailsCtrl.$inject = ['$state', '$stateParams', 'serverApi', 'funcFactory'];

angular.module('app.incoming_emails').component('incomingEmails', {
    controller: IncomingEmailsCtrl,
    controllerAs: '$ctrl',
    templateUrl: '/app/incoming_emails/components/incoming-emails/incoming-emails.html'
});
