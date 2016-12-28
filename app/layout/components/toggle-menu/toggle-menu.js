class ToggleMenuCtrl {
    constructor($scope) {
        this.$body = $('body');
        let self = this;
        $scope.$on('requestToggleMenu', () => self.toggleMenu());
    }

    toggleMenu() {
        if (!this.$body.hasClass('menu-on-top')){
            $('html').toggleClass('hidden-menu-mobile-lock');
            this.$body.toggleClass('hidden-menu');
            this.$body.removeClass('minified');
        } else if ( this.$body.hasClass('menu-on-top') && this.$body.hasClass('mobile-view-activated') ) {
            $('html').toggleClass('hidden-menu-mobile-lock');
            this.$body.toggleClass('hidden-menu');
            this.$body.removeClass('minified');
        }
    }
}

ToggleMenuCtrl.$inject = ['$scope'];

angular.module('app.layout').component('toggleMenu', {
    controller: ToggleMenuCtrl,
    controllerAs: 'toggleMenuCtrl',
    templateUrl: '/app/layout/components/toggle-menu/toggle-menu.html'
});
