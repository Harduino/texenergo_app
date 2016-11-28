angular.module('login', ['ui.router']).config(['$stateProvider', $stateProvider => {
    $stateProvider.state('login', {
        url: '/sign_in',
        views: {
            root: {
                template: '<login></login>'
            }
        }
    });
}]);
