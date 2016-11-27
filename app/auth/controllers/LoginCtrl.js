/**
 * Created by Egor Lobanov on 31.01.16.
 * Controller of Sign in page
 */
(function(){
    angular.module('login').controller('loginCtrl', ['authService', function(authService) {
        authService.login();

        this.goToPaswordless = function() {
            authService.logInPaswordless();
        };
    }]);
}());