class JarvisWidgetCtrl {
    constructor($rootScope) {
        let element = $('#' + this.for);

        if(element.data('widget-color')) {
            element.addClass('jarviswidget-color-' + element.data('widget-color'));
        }

        element.find('.widget-body').prepend('<div class="jarviswidget-editbox"><input class="form-control" type="text"></div>');
        element.addClass('jarviswidget');
        $rootScope.$emit('jarvisWidgetAdded', element);
    }
}

JarvisWidgetCtrl.$inject = ['$rootScope'];

angular.module('app.layout').component('jarvisWidget', {
    bindings: {for: '@'},
    controller: JarvisWidgetCtrl
});
