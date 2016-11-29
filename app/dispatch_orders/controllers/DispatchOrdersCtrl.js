class DispatchOrdersCtrl {
    constructor($state, $stateParams) {
        this.visual = {
            navButtsOptions:[
                {type: 'refresh', callback: () => $state.go('app.dispatch_orders', {}, {reload:true})}
            ],
            navTableButts: [
                {type: 'view', callback: (id) => $state.go('app.dispatch_orders.view', {id: id})},
                {type: 'remove'}
            ],
            titles: ['Списания']
        };

        this.data = {ordersList:[], searchQuery: $stateParams.q};
    }
}

DispatchOrdersCtrl.$inkect = ['$state', '$stateParams'];
angular.module('app.dispatch_orders').controller('DispatchOrdersCtrl', DispatchOrdersCtrl);
