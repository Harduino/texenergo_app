(function () {
    'use strict';

    var module = angular.module('app.dashboard', ['ui.router']);

    module.config(function ($stateProvider) {
        $stateProvider
            .state('app.dashboard', {
                url: '/dashboard',
                views: {
                    "content@app": {
                        controller: 'DashboardCtrl',
                        controllerAs: 'dashboardCtrl',
                        templateUrl: '/app/dashboard/views/dashboard.html'
                    }
                },
                data:{
                    title: 'Рабочий стол'
                }
            });
    });
}());