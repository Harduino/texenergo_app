class ToggleShortcut{
    constructor($timeout, authService, $compile, $state) {
        let initDomEvents = function ($element, $scope) {
            var shortcutBlock = $('#shortcut');
            $compile(shortcutBlock)($scope);

            $scope.navigateToProfilePage = function() {
                var authProfile = authService.profile;
                $state.go('app.contacts.view', authProfile ? {id: authProfile.user_metadata.contact_id} : null);
                $timeout(hideShortcutBlock, 300);
            };

            $element.on('click', showShortcutBlock);

            // SHORTCUT buttons goes away if mouse is clicked outside of the area
            $(document).mouseup(function (e) {
                if (shortcutBlock && !shortcutBlock.is(e.target) && shortcutBlock.has(e.target).length === 0) {
                    hideShortcutBlock();
                }
            });

            // SHORTCUT ANIMATE HIDE
            function hideShortcutBlock() {
                shortcutBlock.animate({height: 'hide'}, 300, 'easeOutCirc');
                $('body').removeClass('shortcut-on');
            }

            // SHORTCUT ANIMATE SHOW
            function showShortcutBlock() {
                shortcutBlock.animate({height: 'show'}, 200, 'easeOutCirc');
                $('body').addClass('shortcut-on');
            }
        };

        let link = function($scope, $element) {
            $timeout(function(){
                initDomEvents($element, $scope);
            });
        };

        this.restrict = 'EA';
        this.link = link;
    }
}

ToggleShortcut.$inject = ['$timeout', 'authService', '$compile', '$state'];

function toggleShortcut($timeout, authService, $compile, $state){
    return new ToggleShortcut($timeout, authService, $compile, $state);
}

angular.module('app.layout').directive('toggleShortcut', toggleShortcut);