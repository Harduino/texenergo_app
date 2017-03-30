class LeftMenuCtrl {
    constructor($state, $timeout) {
        let self = this;

        this.items.forEach((menuItem, menuItemIndex) => {
            if(menuItem.items !== undefined) {
                menuItem.items.forEach(menuSubItem => {
                    if(menuSubItem.state === $state.current.name) {
                        self.expandedMenuItem = self.expandedByDefault = menuItemIndex;
                        $timeout(() => $('#left-menu-subitems-' + menuItemIndex).show());
                    }
                });
            }
        });
    }

    setExpandedItem(menuItemIndex) {
        if(this.expandedMenuItem !== menuItemIndex) {
            $('#left-menu-subitems-' + this.expandedMenuItem).slideToggle(appConfig.menu_speed || 200);
        }

        this.expandedMenuItem = this.expandedMenuItem === menuItemIndex ? undefined : menuItemIndex;
        $('#left-menu-subitems-' + menuItemIndex).slideToggle(appConfig.menu_speed || 200);
    }
}

LeftMenuCtrl.$inject = ['$state', '$timeout'];

angular.module('app.layout').component('leftMenu', {
    bindings: {items: '<'},
    controller: LeftMenuCtrl,
    controllerAs: '$ctrl',
    templateUrl: '/app/layout/components/left-menu/left-menu.html'
});
