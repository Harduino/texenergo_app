/**
 * Created by Egor Lobanov on 10.10.16.
 */
(function(){
    var app = angular.module('app');

    app.config(function ($provide, $httpProvider, lockProvider, lockPasswordlessProvider) {
        //CSRF
        $httpProvider.defaults.headers.common['X-CSRF-Token'] = $('meta[name=csrf-token]').attr('content');
        // satisfy request.xhr? check on server-side
        // $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        $httpProvider.defaults.headers.common['Accept'] = 'application/json;charset=utf-8';
        $httpProvider.defaults.headers.common['Content-Type'] = 'application/json; charset=utf-8';
        // $httpProvider.defaults.withCredentials = true;

        const lockConfig = {
            clientID: 'cO4FFzRFn4JkByDDy2kCWAFKNdC37BcW',
            domain: 'texenergo.eu.auth0.com',
            options: {
                theme: {
                    logo: 'assets/img/logo.png',
                    primaryColor: 'rgb(240,125,27)'
                },
                languageDictionary: {
                    title: ""
                },
                closable: false,
                language: 'ru'
            }
        };

        lockProvider.init(lockConfig);

        lockPasswordlessProvider.init(lockConfig);

        // Intercept http calls.
        $provide.factory('ErrorHttpInterceptor', ['$q', '$rootScope', '$location', 'authService', function ($q, $rootScope, $location, authService) {
            var errorCounter = 0;
            function notifyError(rejection){
                $.bigBox({
                    title: rejection.status + ' ' + rejection.statusText,
                    content: rejection.data,
                    color: "#C46A69",
                    icon: "fa fa-warning shake animated",
                    number: ++errorCounter,
                    timeout: 6000
                });
            }

            function setInload(inLoad){
                $rootScope.showRibbonLoader = inLoad;
            }

            return {
                request: function(config){
                    var url = encodeURI(config.url);
                    var re  = /http|html/,
                        dadataMatcher = url.match(/dadata/g);
                    config.url = ((config.method == 'GET' &&  url.match(re) !== null) || dadataMatcher !== null)  ? url : appConfig.serverUrl + url;
                    dadataMatcher == null && (config.headers.Authorization = "Bearer " + authService.token);
                    setInload(true);
                    return config;
                },
                response: function(response){
                    setInload(false);
                    return response;
                },
                // On request failure
                requestError: function (rejection) {
                    setInload(false);
                    // show notification
                    notifyError(rejection);

                    // Return the promise rejection.
                    return $q.reject(rejection);
                },
                responseError: function (rejection) {
                    console.log(rejection);
                    var s = rejection.status;
                    if(s == 401) $location.path('sign_in');
                    else if (s == 403) notifyError({status: "Ошибка", statusText: 'Не достаточно прав!'});
                    else s !==-1 && notifyError(rejection);
                    return $q.reject(rejection);
                }
            };
        }]);

        // Add the interceptor to the $httpProvider.
        $httpProvider.interceptors.push('ErrorHttpInterceptor');

    });
}());