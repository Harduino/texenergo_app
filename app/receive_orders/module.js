/**
 * Created by Mikhail Arzhaev on 26.11.15.
 * Модуль страницы движения
 */
(function () {

    "use strict";

    var module = angular.module('app.receive_orders', ['ui.router']);

    module.config(function ($stateProvider) {
        $stateProvider.state('app.receive_orders', {
            url: '/receive_orders?q',
            data:{
                title: 'Поступление',
                access:{
                    action:'index',
                    params:'ReceiveOrder'
                }
            },
            params:{
                q:''
            },
            views:{
                "content@app": {
                    controller: 'ReceiveOrdersCtrl',
                    templateUrl: '/app/receive_orders/views/receive_orders.html'
                }
            }
        }).state('app.receive_orders.view', {
            url: '/:id',
            data:{
                title: 'Просмотр поступления',
                access:{
                    action:'read',
                    params:'ReceiveOrder'
                }
            },
            views:{
                "content@app":{
                    controller: 'ViewReceiveOrderCtrl',
                    templateUrl: '/app/receive_orders/views/viewReceiveOrder.html'
                }
            }
        }).state('app.receive_orders.view.edit', {
            url:'/edit',
            data:{
                title: 'Редактирование поступления',
                access:{
                    action:'edit',
                    params:'ReceiveOrder'
                }
            },
            views:{
                "content@app":{
                    controller: 'EditReceiveOrderCtrl',
                    templateUrl: '/app/receive_orders/views/editReceiveOrder.html'
                }
            }
        });
    });
}());