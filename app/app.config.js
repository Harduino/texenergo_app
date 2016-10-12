/**
 * Created by Egor Lobanov on 10.10.16.
 */
(function(){
    var app = angular.module('app');

    app.config(function ($provide, $httpProvider, lockProvider) {
        //CSRF
        $httpProvider.defaults.headers.common['X-CSRF-Token'] = $('meta[name=csrf-token]').attr('content');
        // satisfy request.xhr? check on server-side
        $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        $httpProvider.defaults.headers.common['Accept'] = 'application/json;charset=utf-8';
        $httpProvider.defaults.headers.common['Content-Type'] = 'application/json; charset=utf-8';
        $httpProvider.defaults.withCredentials = true;


        lockProvider.init({
            clientID: 'cO4FFzRFn4JkByDDy2kCWAFKNdC37BcW',
            domain: 'texenergo.eu.auth0.com'
        });

        // Intercept http calls.
        $provide.factory('ErrorHttpInterceptor', ['$q', '$rootScope', '$location', function ($q, $rootScope, $location) {
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
                    var re  = /http/;
                    config.url = (config.method == 'GET' && url.indexOf('html')>-1) || url.match(re) !== null  ? url : appConfig.serverUrl + url;
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