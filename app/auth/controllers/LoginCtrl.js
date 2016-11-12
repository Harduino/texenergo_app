/**
 * Created by Egor Lobanov on 31.01.16.
 * Controller of Sign in page
 */
(function(){
    angular.module('login').controller('loginCtrl', ['authService', '$scope', function(authService, sc){

        authService.login();

        sc.goToPaswordless = function(){
            authService.logInPaswordless();
        }
    }]);
}());