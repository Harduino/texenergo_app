class OrdersFilterCtrl {
    constructor($state) {
        this.$state = $state;
    }

    executeSearch (e) {
        if(!e || (e.keyCode == 13)) {
            let query = this.searchQuery;
            this.$state.transitionTo(this.toState, query ? {q: query} : {}, {reload: true});
        }
    }
}

OrdersFilterCtrl.$inject = ['$state'];

angular.module('app.layout').component('ordersFilter', {
    bindings: {searchQuery: '=', toState: '@'},
    controller: OrdersFilterCtrl,
    controllerAs: '$ctrl',
    templateUrl: 'app/layout/components/orders-filter/orders-filter.html'
});
