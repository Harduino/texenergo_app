/**
 * Created by Egor Lobanov on 10.10.16.
 */
(function(){
    angular.module('login').service('authService', ['$rootScope', 'lock', '$localStorage', function($rootScope, lock, $localStorage){


        var token = $localStorage.id_token,
            profile = $localStorage.profile;

        function login(){
            lock.show();
        }

        function logout(){
            token = null;
            profile = null;
            $localStorage.id_token = null;
            $localStorage.profile = null;
        }

        function registerAuthenticationListener(){
            lock.on('authenticated', function(authResult) {
                console.log('auth result', authResult);
                token = $localStorage.id_token = authResult.idToken;

                lock.getProfile(authResult.idToken, function(error, profile) {
                    console.log(profile);
                    if (error) {
                        console.log(error);
                    }

                    $localStorage.profile = profile;
//                    $rootScope.$broadcast('userProfileSet', profile);
                });
            });
        }

        return {
            get token(){
                return token;
            },
            get profile(){
                return profile
            },
            logout: logout,
            login: login,
            registerAuthenticationListener: registerAuthenticationListener
        }
    }]);
}());