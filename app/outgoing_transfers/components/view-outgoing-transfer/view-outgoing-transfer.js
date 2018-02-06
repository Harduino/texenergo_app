class ViewOutgoingTransferCtrl {
    constructor($state, $stateParams) {
    }
}

ViewOutgoingTransferCtrl.$inject = ['$state', '$stateParams'];

angular.module('app.outgoing_transfers').component('viewOutgoingTransfer', {
    controller: ViewOutgoingTransferCtrl,
    controllerAs: 'viewOutgoingTransferCtrl',
    templateUrl: '/app/outgoing_transfers/components/view-outgoing-transfer/view-outgoing-transfer.html'
});
