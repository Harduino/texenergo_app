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
                        controller: 'LayoutCtrl'
                    }
                }
            });
        $urlRouterProvider
            .otherwise(function($injector){
                var authService= $injector.get('authService'),
                    token = authService.token;
                if(!token || authService.isTokenExpired(token)){
                    return '/sign_in'
                }
                return '/dashboard';
            });

    });

    module.controller('LayoutCtrl', ['$scope', '$state', 'serverApi', 'authService', function($scope, $state, serverApi, authService){
        var sc = $scope,
            profile = authService.profile || {};

        sc.searchText = '';

        //выполняем поиск по клику на кнопку в топ меню
        sc.executeSearch = function(){
            $state.go('app.search', {searchString: sc.searchText, page:0});
        };

        sc.signOut = function(){
            authService.logout();
//            window.location.reload();
        };

        sc.logo = 'assets/img/logo.png';
        sc.company_name = 'Texenergo';

        var yaParams = { current_user: profile.email };
        if (window.location.hostname.match(/texenergo/) != undefined) {
            (function (d, w, c) { (w[c] = w[c] || []).push(function() { try { w.yaCounter7987369 = new Ya.Metrika({ id:7987369, webvisor:true, trackHash:true, params:window.yaParams||{ } }); } catch(e) { } }); var n = d.getElementsByTagName("script")[0], s = d.createElement("script"), f = function () { n.parentNode.insertBefore(s, n); }; s.type = "text/javascript"; s.async = true; s.src = (d.location.protocol == "https:" ? "https:" : "http:") + "//mc.yandex.ru/metrika/watch.js"; if (w.opera == "[object Opera]") { d.addEventListener("DOMContentLoaded", f, false); } else { f(); } })(document, window, "yandex_metrika_callbacks");
            (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
                (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
                m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
            })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
            ga('create', 'UA-24356682-5', 'auto');
            ga('send', 'pageview');
            ga('set', (yaParams || {}) );
        }
    }]);

    module.controller('LayoutNavigationCtrl', ['$scope', function(sc){
//        sc.index = window.gon.index;
    }]);

    return module;
}());