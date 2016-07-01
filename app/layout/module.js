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
            .when('', angular.noop)
            .when('/', angular.noop)
            .otherwise(function () {
                return '/dashboard';
        });

    });

    module.controller('LayoutCtrl', ['$scope', '$state', 'serverApi', function($scope, $state, serverApi){
        var sc = $scope;
        sc.searchText = '';
        //выполняем поиск по клику на кнопку в топ меню
        sc.executeSearch = function(){
            $state.go('app.search', {searchString: sc.searchText, page:0});
        };

        sc.signOut = serverApi.signOut;

        sc.logo = window.gon.logo_url;
        sc.company_name = window.gon.company_name;
    }]);

    module.controller('LayoutNavigationCtrl', ['$scope', function(sc){
        sc.index = window.gon.index;
    }]);

    return module;
}());