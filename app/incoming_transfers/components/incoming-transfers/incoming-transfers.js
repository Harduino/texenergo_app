class IncomingTransfersCtrl {
    constructor($state, $stateParams, serverApi, CanCan, funcFactory) {
        let self = this;

        this.visual = {
            navButtsOptions:[
                {type: 'new', callback: () => self.newTransferConfig.showForm()},
                {type: 'refresh', callback: () => $state.go('app.incoming_transfers', {}, {reload: true})}
            ],
            navTableButts:[
                {
                    type: 'view',
                    callback: item => $state.go('app.incoming_transfers.view', {id: item.data.id || item.data._id})
                },
                {
                    type: 'remove',
                    callback: item => {
                        $.SmartMessageBox({
                            title: 'Удалить входящий платёж?',
                            content: 'Вы действительно хотите удалить входящий платёж ' + item.data.number,
                            buttons: '[Нет][Да]'
                        }, ButtonPressed => {
                            if (ButtonPressed === 'Да') {
                                serverApi.deleteIncomingTransfer(item.data.id, result => {
                                    if(!result.data.errors) {
                                        self.data.incomingTransfersList.splice(item.index, 1);
                                        funcFactory.showNotification('Платеж ' + item.data.number + ' успешно удален.',
                                            '', true);
                                    } else {
                                        funcFactory.showNotification('Не удалось удалить платеж ' + item.data.number,
                                            result.data.errors);
                                    }
                                });
                            }
                        });
                    }
                }
            ],
            role:{
                can_edit: CanCan.can('edit', 'IncomingTransfer'),
                can_destroy: CanCan.can('destroy', 'IncomingTransfer')
            },
            titles: ['Входящие платежи']
        };

        this.data = {incomingTransfersList:[], searchQuery: $stateParams.q};
        this.newTransferConfig = {createMethod: serverApi.createIncomingTransfer, showForm: angular.noop};
    }
}

IncomingTransfersCtrl.$inject = ['$state', '$stateParams', 'serverApi', 'CanCan', 'funcFactory'];

angular.module('app.incoming_transfers').component('incomingTransfers', {
    controller: IncomingTransfersCtrl,
    controllerAs: 'incomingTransfersCtrl',
    templateUrl: '/app/incoming_transfers/components/incoming-transfers/incoming-transfers.html'
});
