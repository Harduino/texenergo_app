class ElmComponentCtrl {
    constructor($timeout, $element, authService) {
        this.$timeout = $timeout;
        this.$element = $element;

        // elmApp.ports.setDat.send("17.01.2017")
        // $( "#datepicker" ).datepicker({onSelect: function (d) {elmApp.ports.setDat.send(d)}});
        if (this.modul !== undefined) {
            var objId = "";
            var matched = window.location.href.match(/\/([a-f0-9]{24})/);
            if (matched !== null) {
              objId = matched[1];
            }
            window.elmApp = Elm[this.modul].embed($element[0], {
                authToken: authService._token,
                apiEndpoint: window.APP_ENV.API_HTTP_BASE_URL,
                objId: objId,
                accessToken: (authService._accessToken || "")
            });
            if (window.elmApp.ports !== undefined && window.elmApp.ports.setPicker !== undefined) {
                window.elmApp.ports.setPicker.subscribe(function(smt) {
                    $("#datepicker").datepicker({onSelect: function (d) {window.elmApp.ports.setDat.send(d)}});
                });
            }
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
