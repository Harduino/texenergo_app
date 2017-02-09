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
        'auth0.lockPasswordless',
        'angular-jwt',
        
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
        '$location',
        'Pubnub'
    ];

    function appRun ($rootScope, $state, $stateParams, lock, authService, $sessionStorage, $location, Pubnub) {

        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;

        const channelName = 'NotificationsChannel';

        // Pubnub.init({
        //     publishKey: 'pub-c-4a35e53c-9bb6-4467-921e-7f2148def73b',
        //     subscribeKey: 'sub-c-4acef304-d658-11e6-978a-02ee2ddab7fe'
        // });

        // var pubnub = new PubNub({publishKey: 'pub-c-4a35e53c-9bb6-4467-921e-7f2148def73b',subscribeKey: 'sub-c-4acef304-d658-11e6-978a-02ee2ddab7fe'})
        // pubnub.publish({channel: 'myChannel', message: 'Hello!', function(status, response){console.log("publish status", status); console.log("publish response", response);}})
        // Pubnub.publish({
        //     channel: 'myChannel',
        //     message: 'Hello!'
        //   }, function(status, response){
        //         console.log("publish status", status);
        //         console.log("publish response", response);
        // });

        // Pubnub.addListener({
        //     status: function(statusEvent) {
        //         if (statusEvent.category === "PNConnectedCategory") {
        //             console.log("pubnub addListener status");
        //         }
        //     },
        //     message: function(message) {
        //         console.log("New Message!!", message);
        //     },
        //     presence: function(presenceEvent) {
        //         // handle presence
        //     }
        // })      
        // console.log("Subscribing..");
        // Pubnub.subscribe({
        //     channels: ['hello_world'] 
        // });


        // debugger;
        // Intercept the hash that comes back from authentication
        // to ensure the `authenticated` event fires
        lock.interceptHash();

        authService.registerAuthenticationListener();

        //scroll page top if page not search
        $rootScope.$on('$stateChangeSuccess', function(){
            if($state.current.name !== "app.search")angular.element('body').scrollTop(0);
        });

        //checking permissions of state while navigating
        $rootScope.$on('$stateChangeStart',
            function (event, toState, toParams, fromState, fromParams) {
                var token = authService.token;
                if((!token || authService.isTokenExpired(token)) && toState.name !== 'login'){
                    event.preventDefault();
                    //remember url return to
                    $sessionStorage.returnToUrl = $location.$$path;
                    $state.transitionTo('login', null, {reload:true});
                }
            }
        );
    }

    Array.prototype.swapItemByindex = function(currentIndex, newIndex){
        var item = this.splice(currentIndex,1)[0];
        this.splice(newIndex,0,item);
    };
}(window.angular));
