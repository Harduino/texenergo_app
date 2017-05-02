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

appConfig.serverUrl = window.APP_ENV.API_HTTP_BASE_URL;

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

    let app = angular.module('app', [
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
        'teBuffer',
        'angularFileUpload',

        //Auth0
        'auth0.lock',
        'auth0.lockPasswordless',
        'angular-jwt',

        //Pubnub
        'pubnub.angular.service',

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

    app.run(appRun);

    appRun.$inject = [
        '$rootScope',
        '$state',
        '$stateParams',
        'lock',
        'authService',
        '$sessionStorage',
        '$location'
    ];

    function appRun ($rootScope, $state, $stateParams, lock, authService, $sessionStorage, $location) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;

        lock.interceptHash();

        authService.registerAuthenticationListener();

        //scroll page top if page not search
        $rootScope.$on('$stateChangeSuccess', () => {
            if($state.current.name !== "app.search")angular.element('body').scrollTop(0);
        });

        //checking permissions of state while navigating
        $rootScope.$on('$stateChangeStart', (event, toState) => {
                let token = authService.token;
                if((!token || authService.isTokenExpired(token)) && toState.name !== 'login'){
                    event.preventDefault();
                    //remember url return to
                    $sessionStorage.returnToUrl = $location.$$path;
                    $state.transitionTo('login', null, {reload:true});
                }
            }
        );
    }

    Array.swapItemByindex = (array, currentIndex, newIndex) => {
      let item = array.splice(currentIndex,1)[0];
      array.splice(newIndex,0,item);
    };
}(window.angular));
