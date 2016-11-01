/**
 * Created by Egor Lobanov on 10.10.16.
 */
(function(){

    angular.module('login').service('authService', ['$rootScope', 'lock', '$localStorage', 'jwtHelper', 'lockPasswordless', '$location', authService]);

    function authService ($rootScope, lock, $localStorage, jwtHelper, lockPasswordless, $location){


        var o = this,
            _token = $localStorage.id_token || null,
            _profile,
            authDomain = 'texenergo.eu.auth0.com';


        Object.defineProperty(this, 'token', {get: function(){
            return $localStorage.id_token || null;
        }});

        Object.defineProperty(this, 'profile', {get: function(){
            return _profile || {};
        }});

        //Get profile if token in storage and not expired;
        if(_token && !jwtHelper.isTokenExpired(_token))getProfile(_token);

        o.login = function(){
//            lock.show();
            lockPasswordless.emailcode(function(error, profile, id_token) {
                if (error) {
                    alert("Error: " + error);
                    return 0;
                }

                _token = $localStorage.id_token = id_token;

                _profile = profile;

                var url = $location.$$absUrl,
                    sharpIndex = url.indexOf('#');

                if (sharpIndex > -1){
                    url = url.slice(0, sharpIndex);
                }

                window.location = url;

                lockPasswordless.close();
            });
        };

        o.logout = function(){
            $localStorage.id_token = null;
            $localStorage.profile = null;
            window.location = window.APP_ENV.PROTOCOL + '://' + authDomain + '/v2/logout?returnTo=' +
                window.APP_ENV.APP_BASE_URL + '&client_id=' + _profile.clientID;
        };

        o.registerAuthenticationListener = function(){
            lock.on('authenticated', function(authResult) {
                console.log('auth result', authResult);
                _token = $localStorage.id_token = authResult.idToken;

                getProfile(authResult.idToken);

                $rootScope.$emit('authenticated');
            });
        };

        o.isTokenExpired = function(token){
            var expired = jwtHelper.isTokenExpired(token);
            expired && ($localStorage.id_token = null);
            return expired;
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
    }
}());