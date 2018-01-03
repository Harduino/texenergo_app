class CustomerOrdersCtrl {
    constructor($state, $stateParams) {
    }
}

CustomerOrdersCtrl.$inject = ['$state', '$stateParams'];

angular.module('app.customer_orders').component('customerOrders', {
    controller: CustomerOrdersCtrl,
    controllerAs: '$ctrl',
    templateUrl: '/app/customer_orders/components/customer-orders/customer-orders.html'
});
