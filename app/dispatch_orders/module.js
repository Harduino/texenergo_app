/**
 * Created by Egor Lobanov on 07.11.15.
 * Модуль страницы движения
 */
(function () {

    "use strict";

    var module = angular.module('app.dispatch_orders', ['ui.router']);

    module.config(function ($stateProvider) {
        $stateProvider.state('app.dispatch_orders', {
            url: '/dispatch_orders?q',
            data:{
                title: 'Списания',
                access:{
                    action:'index',
                    params:'DispatchOrder'
                }
            },
            params:{
                q:''
            },
            views:{
                "content@app": {
                    controller: 'DispatchOrdersCtrl',
                    controllerAs: 'dispatchOrdersCtrl',
                    templateUrl: '/app/dispatch_orders/views/dispatch_orders.html'
                }
            }
        }).state('app.dispatch_orders.view', {
            url: '/:id',
            data:{
                title: 'Просмотр списания',
                access:{
                    action:'read',
                    params:'DispatchOrder'
                }
            },
            views:{
                "content@app":{
                    controller: 'ViewDispatchOrderCtrl',
                    templateUrl: '/app/dispatch_orders/views/viewDispatchOrder.html'
                }
            }
        }).state('app.dispatch_orders.view.logs', {
            url: '/logs',
            data:{
                title:'История списания',
                access:{
                    action:'logs',
                    params:'DispatchOrder'
                }
            },
            views:{
                "content@app":{
                    controller: 'LogsDispatchOrderCtrl',
                    templateUrl: '/app/dispatch_orders/views/logsDispatchOrder.html'
                }
            }
        });
    });
}());