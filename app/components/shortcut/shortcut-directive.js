/**
 * Shortcut-directive
 */
class ToggleShortcut{
    constructor($timeout, authService, $compile, $state){

        let initDomEvents = function ($element, $scope) {

            var shortcut_dropdown = $('#shortcut');

            $compile(shortcut_dropdown)($scope);

            $scope.goToShortCutItem = function(state, params){
                var p = params || null;

                if(state === 'app.contacts.view'){
                    var authProfile = authService.profile;
                    if(authProfile){
                        p = {
                            id:authProfile.user_metadata.contact_id
                        };
                    }
                }

                $state.go(state, p);
                window.setTimeout(shortcut_buttons_hide, 300);
            };

            $element.on('click', function () {
                if (shortcut_dropdown.is(":visible")) {
                    shortcut_buttons_hide();
                } else {
                    shortcut_buttons_show();
                }

            });

            // SHORTCUT buttons goes away if mouse is clicked outside of the area
            $(document).mouseup(function (e) {
                if (shortcut_dropdown && !shortcut_dropdown.is(e.target) && shortcut_dropdown.has(e.target).length === 0) {
                    shortcut_buttons_hide();
                }
            });

            // SHORTCUT ANIMATE HIDE
            function shortcut_buttons_hide() {
                shortcut_dropdown.animate({
                    height: "hide"
                }, 300, "easeOutCirc");
                $('body').removeClass('shortcut-on');

            }

            // SHORTCUT ANIMATE SHOW
            function shortcut_buttons_show() {
                shortcut_dropdown.animate({
                    height: "show"
                }, 200, "easeOutCirc");
                $('body').addClass('shortcut-on');
            }
        };

        let link = function($scope, $element){
            $timeout(function(){
                initDomEvents($element, $scope);
            });
        };

        this.restrict = 'EA';
        this.link = link;
    }
}

toggleShortcut.$inject = ['$timeout', 'authService', '$compile', '$state'];

function toggleShortcut($timeout, authService, $compile, $state){
    return new ToggleShortcut($timeout, authService, $compile, $state);
}

angular.module('app.layout').directive('toggleShortcut', toggleShortcut);