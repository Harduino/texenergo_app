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
            if (window.elmApp.ports !== undefined) {
                if (window.elmApp.ports.setPicker !== undefined) {
                    window.elmApp.ports.setPicker.subscribe(function(smt) {
                        $("#datepicker").datepicker({
                          onSelect: function (dateSelected) {
                            // We are using a Russian locale, but Elm's Date parser accepts only US format.
                            // May this be a quick work-around
                            var datePartioned = dateSelected.split(".");
                            var dateUsFormat = datePartioned[1] + "." + datePartioned[0] + "." + datePartioned[2];
                            window.elmApp.ports.setDat.send(dateUsFormat);
                          }
                        });
                    });
                }

                if (window.elmApp.ports.toJsSetTinyMce !== undefined) {
                    window.elmApp.ports.toJsSetTinyMce.subscribe(function(){
                        // We are in SPA business. Hence remove any inherited TinyMCEs.
                        tinymce.EditorManager.editors = [];
                        // Here we take a small timeout to wait until Elm renders the actual view
                        setTimeout(function(){
                            tinymce.init({selector: "textarea"});
                        }, 500);
                    });
                }

                if (window.elmApp.ports.toJsGetTinyMce !== undefined) {
                    window.elmApp.ports.toJsGetTinyMce.subscribe(function(){
                        window.elmApp.ports.fromJsTinyMceContent.send(tinymce.activeEditor.getContent());
                    });
                }
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
