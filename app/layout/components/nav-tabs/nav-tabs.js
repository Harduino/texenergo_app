class NavTabsCtrl {
    constructor($element) {
        $element.find('a[data-toggle="tab"]').each((ind, link) => {
            let l = $(link);
            l.attr('data-target', l.attr('href')).removeAttr('href');
        });
    }
}

NavTabsCtrl.$inject = ['$element'];

angular.module('app.layout').component('navTabs', {
    controller: NavTabsCtrl
});
