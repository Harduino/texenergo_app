class LeftMenuCtrl {
    constructor($state) {
        let self = this;

        this.items.forEach(function(menuItem, menuItemIndex) {
            if(menuItem.items !== undefined) {
                menuItem.items.forEach(function(menuSubItem) {
                    if(menuSubItem.state === $state.current.name) {
                        self.expandedMenuItem = menuItemIndex;
                        self.expandedByDefault = menuItemIndex;
                    }
                });
            }
        });
    }

    setExpandedItem(menuItemIndex) {
        this.expandedMenuItem = this.expandedMenuItem === menuItemIndex ? undefined : menuItemIndex;
    }
}

LeftMenuCtrl.$inject = ['$state'];

angular.module('app.layout').component('leftMenu', {
    bindings: {items: '<'},
    controller: LeftMenuCtrl,
    controllerAs: '$ctrl',
    templateUrl: '/app/layout/components/left-menu/left-menu.html'
});
