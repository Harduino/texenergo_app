class OutgoingTransfersCtrl {
    constructor($state, $stateParams, serverApi, funcFactory) {
        let self = this;

        this.visual = {
            navButtsOptions:[
                {type: 'new', callback: () => self.newTransferConfig.showForm()},
                {type:'refresh', callback: () => $state.go('app.outgoing_transfers', {}, {reload: true})}
            ],
            navTableButts: [
                {
                    type:'view',
                    callback: item => $state.go('app.outgoing_transfers.view', {id: item.data.id || item.data._id})
                },
                {
                    type:'remove',
                    callback: (item, button, $event) => {
                        $.SmartMessageBox({
                            title: 'Удалить исходящий платёж?',
                            content: 'Вы действительно хотите удалить исходящий платёж ' + item.data.number,
                            buttons: '[Нет][Да]'
                        }, ButtonPressed => {
                            if (ButtonPressed === 'Да') {
                                button.disableOnLoad(true, $event);
                                serverApi.deleteOutgoingTransfer(item.data.id, result => {
                                    button.disableOnLoad(false, $event);
                                    if(!result.data.errors) {
                                        self.data.outgoingTransfersList.splice(item.index, 1);
                                        funcFactory.showNotification('Исходящий платёж', 'Вы удалили исходящий платёж '
                                            + item.data.number, true);
                                    } else {
                                        funcFactory.showNotification('Не удалось удалить платеж ' + item.data.number,
                                            result.data.errors);
                                    }
                                });
                            }
                        }, function(){
                          button.disableOnLoad(false, $event);
                        });
                    }
                }
            ],
            titles: ['Исходящий платёж']
        };

        this.data = {outgoingTransfersList:[], searchQuery: $stateParams.q};
        this.newTransferConfig = {createMethod: serverApi.createOutgoingTransfer, showForm: angular.noop};
    }
}

OutgoingTransfersCtrl.$inject = ['$state', '$stateParams', 'serverApi', 'funcFactory'];

angular.module('app.outgoing_transfers').component('outgoingTransfers', {
    controller: OutgoingTransfersCtrl,
    controllerAs: 'outgoingTransfersCtrl',
    templateUrl: '/app/outgoing_transfers/components/outgoing-transfers/outgoing-transfers.html'
});
