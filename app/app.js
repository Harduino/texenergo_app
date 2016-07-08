'use strict';

/**
 * @ngdoc overview
 * @name app [smartadminApp]
 * @description
 * # app [smartadminApp]
 *
 * Main module of the application.
 */

window.appConfig = {};

appConfig.menu_speed = 200;

appConfig.serverUrl = 'http://' + (window.location.host.match(/localhost|127\.0\.0\.1/) == null ? 'www.texenergo.com' : 'localhost:3000');

//console.log(appConfig.serverUrl);

appConfig.smartSkin = "smart-style-0";

appConfig.skins = [
    {name: "smart-style-0",
        logo: "styles/img/logo.png",
        class: "btn btn-block btn-xs txt-color-white margin-right-5",
        style: "background-color:#4E463F;",
        label: "Smart Default"},

    {name: "smart-style-1",
        logo: "styles/img/logo-white.png",
        class: "btn btn-block btn-xs txt-color-white",
        style: "background:#3A4558;",
        label: "Dark Elegance"}
];



appConfig.sound_path = "/app/sound/";
appConfig.sound_on = true;

(function (angular) {

    $.sound_path = appConfig.sound_path;
    $.sound_on = appConfig.sound_on;

    var app = angular.module('app', [
        'ngSanitize',
        'ngCookies',
        'ngAnimate',
        'ui.router',
        'ui.bootstrap',
        'infinite-scroll',
        'ui.select',
        'ui.tinymce',
        'angular.d3',
        'te.infinity.scroll',
        'te-jq-ui',
        'teBuffer',
        'angularFileUpload',
        
        // Permissions
        'cancan.export',
        // App
        'app.layout',
        'login',
        'app.templates',
        'app.search',
        'app.dashboard',
        'app.customer_orders',
        'app.dispatch_orders',
        'app.quotation_orders',
        'app.contacts',
        'app.partners',
        'app.supplier_orders',
        'app.catalogues',
        'app.manufacturers',
        'app.pdf_catalogues',
        'app.incoming_transfers',
        'app.outgoing_transfers',
        'app.receive_orders',
        'app.products'
    ]);

    app.config(function ($provide, $httpProvider) {
        //CSRF
        $httpProvider.defaults.headers.common['X-CSRF-Token'] = $('meta[name=csrf-token]').attr('content');
        // satisfy request.xhr? check on server-side
        $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        $httpProvider.defaults.headers.common['Accept'] = 'application/json;charset=utf-8';
        $httpProvider.defaults.headers.common['Content-Type'] = 'application/json; charset=utf-8';
        $httpProvider.defaults.withCredentials = true;


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

    app.run(['$rootScope', '$state', '$stateParams', 'CanCan', 'Abilities', '$location', function ($rootScope, $state, $stateParams, CanCan, Abilities, $location) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;

        //scroll page top if page not search
        $rootScope.$on('$stateChangeSuccess', function(){
            if($state.current.name !== "app.search")angular.element('body').scrollTop(0);
        });

        //checking permissions of state while navigating
        $rootScope.$on('$stateChangeStart',
            function (event, toState, toParams, fromState, fromParams) {

                if(toState.name !== 'login' && !window.gon) {
                    event.preventDefault();
                    Abilities.getGon(toState.name, toParams);
                    return 0;
                }

                var access = (toState.data || {}).access;
                if(access){
                    var can = CanCan.can(access.action, access.params);
                    if(!can) {
                        event.preventDefault();
                        $state.transitionTo('app.dashboard', null, {reload:true});
                    }
                }
            }
        );

        $location.$$path === '' &&  $state.go('app.dashboard');
    }]);

    Array.prototype.swapItemByindex = function(currentIndex, newIndex){
        var item = this.splice(currentIndex,1)[0];
        this.splice(newIndex,0,item);
    };
}(window.angular));
