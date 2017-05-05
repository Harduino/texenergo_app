class LazyLoadedListCtrl {
    constructor (serverApi) {
        this.fetch = serverApi[this.apiMethod];
    }
}

LazyLoadedListCtrl.$inject = ['serverApi'];

angular.module('app.layout').component('lazyLoadedList', {
    bindings: {apiMethod: '@', items: '=', navOptions: '=', role: '=', searchQuery: '=', view: '@'},
    templateUrl: 'app/layout/components/lazy-loaded-list/lazy-loaded-list.html',
    controller: LazyLoadedListCtrl,
    controllerAs: '$ctrl'
});
