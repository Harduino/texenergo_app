class ViewOutgoingTransferCtrl {
    constructor($state, $stateParams, serverApi) {
        let self = this;
        this.outgoingTransfer = {};

        this.visual = {
            navButtsOptions:[
                {type: 'back', callback: () => $state.go('app.outgoing_transfers', {})},
                {
                    type: 'refresh',
                    callback: (subData, button, $event) => {
                        button.disableOnLoad(true, $event);
                        serverApi.getOutgoingTransferDetails($stateParams.id, res => {
                          button.disableOnLoad(false, $event);
                          self.outgoingTransfer = res.data;
                        }, function(){
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
            titles: 'Исходящий платёж: '
        };

        serverApi.getOutgoingTransferDetails($stateParams.id, result => {
            let transfer = self.outgoingTransfer = result.data;

            self.fileModalOptions = {
                url:'/api/outgoing_transfers/' + transfer.id + '/documents',
                files: transfer.documents,
                r_delete: serverApi.deleteFile,
                view: 'outgoing_transfers',
                id: transfer.id
            };
        });
    }
}

ViewOutgoingTransferCtrl.$inject = ['$state', '$stateParams', 'serverApi'];

angular.module('app.outgoing_transfers').component('viewOutgoingTransfer', {
    controller: ViewOutgoingTransferCtrl,
    controllerAs: 'viewOutgoingTransferCtrl',
    templateUrl: '/app/outgoing_transfers/components/view-outgoing-transfer/view-outgoing-transfer.html'
});
