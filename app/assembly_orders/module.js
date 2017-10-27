/**
 * Created by Mikhail on 24.02.16.
 * Модуль страницы заказов
 */
(function () {

    "use strict";

    var module = angular.module('app.assembly_orders', ['ui.router', 'easypiechart']);

    module.config(function ($stateProvider) {
        $stateProvider.state('app.assembly_orders', {
            url: '/assembly_orders?q',
            data:{
                title: 'Выпуски с производства',
                access:{
                    action:'index',
                    params:'AssemblyOrder'
                }
            },
            params:{
                q:'',
                id:''
            },
            views:{
                "content@app": {
                    template: '<assembly-orders></assembly-orders>'
                }
            }
        }).state('app.assembly_orders.view', {
            url: '/:id',
            data:{
                title: 'Выпуск с производства',
                access:{
                    action:'read',
                    params:'AssemblyOrder'
                }
            },
            views:{
                "content@app":{
                    template: '<view-assembly-order></view-assembly-order>'
                }
            }
        });
    });
}());