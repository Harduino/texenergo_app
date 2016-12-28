class MinimizeMenuCtrl {
    constructor() {
        this.$body = $('body');
    }

    minimizeMenu() {
        if (!this.$body.hasClass('menu-on-top')) {
            this.$body.toggleClass('minified');
            this.$body.removeClass('hidden-menu');
            $('html').removeClass('hidden-menu-mobile-lock');
        }
    }
}

angular.module('app.layout').component('minimizeMenu', {
    controller: MinimizeMenuCtrl,
    controllerAs: 'minimizeMenuCtrl',
    templateUrl: '/app/layout/components/minimize-menu/minimize-menu.html'
});
