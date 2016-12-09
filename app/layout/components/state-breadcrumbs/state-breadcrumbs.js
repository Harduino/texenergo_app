class StateBreadcrumbsCtrl {
    constructor($rootScope, $state) {
        this.breadcrumbs = [];
        this.$state = $state;
        this.processState($state.current);

        let self = this;
        $rootScope.$on('$stateChangeStart', (event, state) => self.processState(state));
    }

    processState(state) {
        this.setBreadcrumbs(this.getBreadcrumbs(state));
    }

    setBreadcrumbs(breadcrumbs) {
        this.breadcrumbs = breadcrumbs;
    }

    getBreadcrumbs(state) {
        return state.data && state.data.breadcrumbs ? state.data.breadcrumbs : this.fetchBreadcrumbs(state.name, []);
    }

    fetchBreadcrumbs(stateName, breadcrunbs) {
        let state = this.$state.get(stateName);

        if (state && state.data && state.data.title && (breadcrunbs.indexOf(state.data.title) == -1)) {
            breadcrunbs.unshift(state.data.title);
        }

        let parentName = stateName.replace(/.?\w+$/, '');
        return parentName ? this.fetchBreadcrumbs(parentName, breadcrunbs) : breadcrunbs;
    }
}

StateBreadcrumbsCtrl.$inject = ['$rootScope', '$state'];

angular.module('app.layout').component('stateBreadcrumbs', {
    templateUrl: '/app/layout/components/state-breadcrumbs/state-breadcrumbs.html',
    controller: StateBreadcrumbsCtrl,
    controllerAs: 'stateBreadcrumbsCtrl'
});
