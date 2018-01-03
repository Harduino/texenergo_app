class IncomingTransfersCtrl {
    constructor($state, $stateParams) {
    }
}

IncomingTransfersCtrl.$inject = ['$state', '$stateParams'];

angular.module('app.incoming_transfers').component('incomingTransfers', {
    controller: IncomingTransfersCtrl,
    controllerAs: '$ctrl',
    templateUrl: '/app/incoming_transfers/components/incoming-transfers/incoming-transfers.html'
});
