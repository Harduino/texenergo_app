angular.module('app.layout').component('navTabs', {
    controller: function($element) {
        $element.find('a[data-toggle="tab"]').each((ind, link) => {
            var l = $(link);
            l.attr('data-target', l.attr('href')).removeAttr('href');
        });
    }
});
