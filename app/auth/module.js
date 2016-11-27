angular.module('login', ['ui.router']).config(['$stateProvider', $stateProvider => {
    $stateProvider.state('login', {
        url: '/sign_in',
        views: {
            root: {
                controller: 'loginCtrl',
                controllerAs: 'loginCtrl',
                templateUrl: '/app/auth/views/login.html'
            }
        }
    });
}]);
