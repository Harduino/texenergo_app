class jQueryUiCtrl {
    constructor($element) {
        let self = this, destructors = [];

        $element.find('[data-ui-type]').each((ind, selector) => {
            let element = $(selector), type = element.attr('data-ui-type');

            if(type && element[type]) {
                element[type](self.options || {});
                destructors.push(() => element[type]('destroy'));
            }
        });

        this.$onDestroy = () => destructors.forEach(destructor => destructor());
    }
}

jQueryUiCtrl.$inject = ['$element'];

angular.module('te-jq-ui').component('teJqUi', {
    bindings: {options: '='},
    controller: jQueryUiCtrl
});
