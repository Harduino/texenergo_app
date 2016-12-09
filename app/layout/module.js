class LayoutCtrl {
    constructor($state, authService, $localStorage) {
        this.$state = $state;
        this.authService = authService;

        this.searchText = '';
        this.logo = 'assets/img/logo.png';
        this.company_name = 'Texenergo';

        if (window.location.hostname.match(/texenergo/) != undefined) {
            var yaParams = {};
            if ($localStorage && $localStorage.profile && $localStorage.profile.user_metadata) {
                yaParams.user_email = $localStorage.profile.user_metadata.email;
                yaParams.user_id = $localStorage.profile.user_metadata.contact_id;
            }
            (function (d, w, c) { (w[c] = w[c] || []).push(function() { try { w.yaCounter7987369 = new Ya.Metrika({ id:7987369, webvisor:true, trackHash:true, params:window.yaParams||{ } }); } catch(e) { } }); var n = d.getElementsByTagName("script")[0], s = d.createElement("script"), f = function () { n.parentNode.insertBefore(s, n); }; s.type = "text/javascript"; s.async = true; s.src = (d.location.protocol == "https:" ? "https:" : "http:") + "//mc.yandex.ru/metrika/watch.js"; if (w.opera == "[object Opera]") { d.addEventListener("DOMContentLoaded", f, false); } else { f(); } })(document, window, "yandex_metrika_callbacks");
            (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
                (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
                m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
            })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
            ga('create', 'UA-24356682-5', 'auto');
            ga('send', 'pageview');
            ga('set', (yaParams || {}) );
        }
    }

    executeSearch() {
        this.$state.go('app.search', {searchString: this.searchText, page: 0});
    }

    signOut() {
        this.authService.logout();
    }
}

LayoutCtrl.$inject = ['$state', 'authService', '$localStorage'];

(function () {

    "use strict";

    var module = angular.module('app.layout', ['ui.router', 'app.templates']);

    module.config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('app', {
                abstract: true,
                views: {
                    root: {
                        templateUrl: '/app/layout/layout.tpl.html',
                        controller: 'LayoutCtrl',
                        controllerAs: 'layoutCtrl'
                    }
                }
            });
        $urlRouterProvider
            .otherwise(function($injector){
                var authService= $injector.get('authService'),
                    token = authService.token,
                    session = $injector.get('$sessionStorage'),
                    returnToUrl = session.returnToUrl;

                if(!token || authService.isTokenExpired(token)){
                    return '/sign_in'
                }

                return returnToUrl || '/dashboard';
            });

    });

    module.controller('LayoutCtrl', LayoutCtrl);
    module.controller('LayoutNavigationCtrl', [function(){}]);

    return module;
}());