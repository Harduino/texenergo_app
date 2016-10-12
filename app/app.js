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

appConfig.serverUrl = (window.location.host.match(/localhost|127\.0\.0\.1/) == null ? 'https://www.texenergo.com' : 'http://localhost:3000');

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
        'ngStorage',
        'ui.bootstrap',
        'infinite-scroll',
        'ui.select',
        'ui.tinymce',
        'angular.d3',
        'te.infinity.scroll',
        'te-jq-ui',
        'teBuffer',
        'angularFileUpload',

        //Auth0
        'auth0.lock',
        'angular-jwt',
        
        // Permissions
        'cancan.export',
        // App
        'app.api',
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

    app.run(['$rootScope',
        '$state',
        '$stateParams',
        'lock',
        'authService',
        function ($rootScope, $state, $stateParams, lock, authService) {

            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;

            // Intercept the hash that comes back from authentication
            // to ensure the `authenticated` event fires
            lock.interceptHash();

            authService.registerAuthenticationListener();

            console.log('token', authService.token);

            //scroll page top if page not search
            $rootScope.$on('$stateChangeSuccess', function(){
                if($state.current.name !== "app.search")angular.element('body').scrollTop(0);
            });

            //checking permissions of state while navigating
            $rootScope.$on('$stateChangeStart',
                function (event, toState, toParams, fromState, fromParams) {

                    if(!authService.token && toState.name !== 'login'){
                        event.preventDefault();
                        $state.transitionTo('login', null, {reload:true});
                    }

//                    if(toState.name !== 'login' && !window.gon) {
//                        event.preventDefault();
//                        Abilities.getGon(toState.name, toParams);
//                        return 0;
//                    }
//
//                    var access = (toState.data || {}).access;
//                    if(access){
//                        var can = CanCan.can(access.action, access.params);
//                        if(!can) {
//                            event.preventDefault();
//                            $state.transitionTo('app.dashboard', null, {reload:true});
//                        }
//                    }
                }
            );
//
//            $location.$$path === '' &&  $state.go('app.dashboard');
    }]);

    Array.prototype.swapItemByindex = function(currentIndex, newIndex){
        var item = this.splice(currentIndex,1)[0];
        this.splice(newIndex,0,item);
    };
}(window.angular));
