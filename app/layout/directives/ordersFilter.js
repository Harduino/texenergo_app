angular.module('app.layout').component('ordersFilter', {
    bindings: {searchQuery: '=', toState: '@'},
    controller: function($state) {
        this.executeSearch = function(e) {
            if(!e || (e.keyCode == 13)) {
                var query = this.searchQuery;
                $state.transitionTo(this.toState, query ? {q: query} : {}, {reload: true});
            }
        };
    },
    controllerAs: '$ctrl',
    template: ['$templateCache', function ($templateCache) {
        return $templateCache.get('ordersFilter.tmpl.html')
    }]
});
