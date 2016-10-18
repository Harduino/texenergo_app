/**
 * Created by Egor Lobanov on 10.10.16.
 */
(function(){
    angular.module('login').service('authService', ['$rootScope', 'lock', '$localStorage', function($rootScope, lock, $localStorage){


        var o = this,
            _token = $localStorage.id_token,
            _profile,
            authDomain = 'texenergo.eu.auth0.com';


        Object.defineProperty(this, 'token', {get: function(){
            return _token;
        }});

        Object.defineProperty(this, 'profile', {get: function(){
            return _profile;
        }});

        //Get profile if token in storage;
        _token && getProfile(_token);

        o.login = function(){
            lock.show();
        };

        o.logout = function(){
            $localStorage.id_token = null;
            $localStorage.profile = null;
            window.location = 'https://' + authDomain + '/v2/logout?returnTo=http://app.texenergo.com&client_id=' + _profile.clientID;
        };

        o.registerAuthenticationListener = function(){
            lock.on('authenticated', function(authResult) {
                console.log('auth result', authResult);
                _token = $localStorage.id_token = authResult.idToken;

                getProfile(authResult.idToken);
            });
        };

        /**
         * Get profile from Auth0
         */
        function getProfile(idToken){
            lock.getProfile(idToken, function(error, profile) {
                console.log(profile);
                if (error) {
                    console.log(error);
                }

                _profile = profile;
            });
        }
    }]);
}());