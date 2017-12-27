class ElmComponentCtrl {
    constructor($timeout, $element, authService) {
        this.$timeout = $timeout;
        this.$element = $element;
        

        if (this.modul !== undefined) {
            Elm[this.modul].embed($element[0], { 
                authToken: authService._token,
                apiEndpoint: window.APP_ENV.API_HTTP_BASE_URL
            });
        }
    }
}


ElmComponentCtrl.$inject = ['$timeout', '$element', 'authService'];

angular.module('angularElmComponents', []).component('elmComponent', {
    bindings: {modul: '@'},
    controller: ElmComponentCtrl,
    controllerAs: '$ctrl',
    templateUrl: 'app/layout/components/elm-component/elm-component.html',
    transclude : true
});
