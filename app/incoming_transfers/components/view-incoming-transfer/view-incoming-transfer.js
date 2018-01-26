class ViewIncomingTransferCtrl {
    constructor($state, $stateParams) {
    }
}

ViewIncomingTransferCtrl.$inject = ['$state', '$stateParams'];

angular.module('app.incoming_transfers').component('viewIncomingTransfer', {
    controller: ViewIncomingTransferCtrl,
    controllerAs: '$ctrl',
    templateUrl: '/app/incoming_transfers/components/view-incoming-transfer/view-incoming-transfer.html'
});
