/**
 * Created by Egor Lobanov on 07.11.15.
 * Модуль страницы заказов
 */
(function () {

    "use strict";

    var module = angular.module('app.customer_orders', ['ui.router', 'easypiechart']);

    module.config(function ($stateProvider) {
        $stateProvider.state('app.customer_orders', {
            url: '/customer_orders?q',
            data:{
                title: 'Заказы',
                access:{
                    action:'index',
                    params:'CustomerOrder'
                }
            },
            params:{
                q:'',
                id:''
            },
            views:{
                "content@app": {
                    template: '<customer-orders></customer-orders>'
                }
            }
        }).state('app.customer_orders.view', {
            url: '/:id',
            data:{
                title: 'Просмотр заказа',
                access:{
                    action:'read',
                    params:'CustomerOrder'
                }
            },
            resolve: {
              profile: function(authService){
                return authService.profilePromise;
              }
            },
            views:{
                "content@app":{
                    template: '<view-customer-order></view-customer-order>'
                }
            }
        }).state('app.customer_orders.view.logs', {
            url: '/logs',
            data: {
                title: 'История заказа',
                access: {
                    action: 'logs',
                    params: 'CustomerOrder'
                }
            },
            views: {
                "content@app": {
                    template: '<logs-customer-order></logs-customer-order>'
                }
            }
        });
    });
}());
