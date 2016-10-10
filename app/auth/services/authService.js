/**
 * Created by Egor Lobanov on 10.10.16.
 */
(function(){
    angular.module('login').service('authService', ['$rootScope', 'lock', function($rootScope, lock){

        function login(){
            lock.show();
        }

        function registerAuthenticationListener(){
            lock.on('authenticated', function(authResult) {
                console.log(authResult);
//                localStorage.setItem('id_token', authResult.idToken);
//                authManager.authenticate();

                lock.getProfile(authResult.idToken, function(error, profile) {
                    console.log(profile);
                    if (error) {
                        console.log(error);
                    }

//                    localStorage.setItem('profile', JSON.stringify(profile));
//                    $rootScope.$broadcast('userProfileSet', profile);
                });
            });
        }

        return {
            login: login,
            registerAuthenticationListener: registerAuthenticationListener
        }
    }]);
}());