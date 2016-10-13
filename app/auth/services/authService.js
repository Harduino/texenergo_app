/**
 * Created by Egor Lobanov on 10.10.16.
 */
(function(){
    angular.module('login').service('authService', ['$rootScope', 'lock', '$localStorage', function($rootScope, lock, $localStorage){


        var o = this,
            _token = $localStorage.id_token;

        Object.defineProperty(this, 'token', {get: function(){
            return _token;
        }});

        o.profile = $localStorage.profile;

        o.login = function(){
            lock.show();
        };

        o.logout = function(){
            _token = null;
            o.profile = null;
            $localStorage.id_token = null;
            $localStorage.profile = null;
        };

        o.registerAuthenticationListener = function(){
            lock.on('authenticated', function(authResult) {
                console.log('auth result', authResult);
                _token = $localStorage.id_token = authResult.idToken;

                lock.getProfile(authResult.idToken, function(error, profile) {
                    console.log(profile);
                    if (error) {
                        console.log(error);
                    }

                    o.profile = $localStorage.profile = profile;
//                    $rootScope.$broadcast('userProfileSet', profile);
                });
            });
        };
    }]);
}());