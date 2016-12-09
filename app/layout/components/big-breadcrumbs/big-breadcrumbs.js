class BigBreadcrumbsCtrl {
    constructor() {
        this.firstItem = _.first(this.items);
        this.restItems = _.rest(this.items);

        if(!this.icon) {
            this.icon = 'home';
        }
    }
}

angular.module('app.layout').component('bigBreadcrumbs', {
    bindings: {items: '<', icon: '@'},
    controller: BigBreadcrumbsCtrl,
    controllerAs: 'bigBreadcrumbsCtrl',
    templateUrl: '/app/layout/components/big-breadcrumbs/big-breadcrumbs.html'
});
