class DispatchOrdersCtrl {
    constructor($state) {
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

        this.data = {ordersList:[], searchQuery: this.query};
    }
}

DispatchOrdersCtrl.$inject = ['$state'];

angular.module('app.dispatch_orders').component('dispatchOrders', {
    controller: DispatchOrdersCtrl,
    controllerAs: 'dispatchOrdersCtrl',
    bindings: {query: '<'},
    templateUrl: '/app/dispatch_orders/components/dispatch-orders/dispatch-orders.html'
});
