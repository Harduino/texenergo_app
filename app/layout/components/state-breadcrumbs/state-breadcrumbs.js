class StateBreadcrumbsCtrl {
    constructor($rootScope, $state, authService) {
        this.breadcrumbs = [];
        this.$state = $state;
        this.processState($state.current);
        this.user = authService;

        let self = this;
        $rootScope.$on('$stateChangeStart', (event, state) => self.processState(state));
    }

    showWarning() {
        if (this.user._profile.app_metadata === undefined || this.user._profile.app_metadata === null) return true;
        if (this.user._profile.app_metadata.partner === undefined || this.user._profile.app_metadata.partner === null) return true;
        if (this.user._profile.app_metadata.partner.id === undefined || this.user._profile.app_metadata.partner.id === null) return true;
        return false;
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

StateBreadcrumbsCtrl.$inject = ['$rootScope', '$state', 'authService'];

angular.module('app.layout').component('stateBreadcrumbs', {
    templateUrl: '/app/layout/components/state-breadcrumbs/state-breadcrumbs.html',
    controller: StateBreadcrumbsCtrl,
    controllerAs: 'stateBreadcrumbsCtrl'
});
