/**
 * Created by Egor Lobanov on 07.11.15.
 * Модуль страницы заказов
 */
(function () {

    "use strict";

    var module = angular.module('app.customer_orders', ['ui.router', 'easypiechart', 'services.notifications']);

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
            views:{
                "content@app":{
                    controller: 'ViewCustomerOrderCtrl',
                    templateUrl: '/app/customer_orders/views/viewCustomerOrder.html'
                }
            }
        }).state('app.customer_orders.view.logs', {
            url: '/logs',
            data:{
                title:'История заказа',
                access:{
                    action:'logs',
                    params:'CustomerOrder'
                }
            },
            views:{
                "content@app":{
                    controller: 'LogsCustomerOrderCtrl',
                    templateUrl: '/app/customer_orders/views/logsCustomerOrder.html'
                }
            }
        });
    });

    module.factory('customerOrdersNotifications', ['notificationServiceBuilder', 'funcFactory', '$localStorage', function(nsb, funcFactory, $localStorage){
        var actions = {
            create: function(productsList, row){
                if ($localStorage.profile && ($localStorage.profile.user_metadata.contact_id != row.user_id)) {
                    var data = row.data[0];
                    productsList.push(data);
                    funcFactory.showNotification("Добавлен продукт", data.product.name + ' добавлен другим пользователем.', true);
                }
            },
            update: function(productsList, row){
                if ($localStorage.profile && ($localStorage.profile.user_metadata.contact_id != row.user_id)) {
                    var datas = row.data;
                    for (var i = 0; i < datas.length; i++) {
                        var data = datas[i];
                        var ind = nsb.getIndexByProperty(productsList, data, 'id');
                        if(ind>-1) productsList[ind] = data;
                        funcFactory.showNotification("Обновлена информация по продукту", data.product.name +' обновлен другим пользователем.', true);
                    }
                }
            },
            destroy: function(productsList, row){
                if ($localStorage.profile && ($localStorage.profile.user_metadata.contact_id != row.user_id)) {
                    var data = row.data;
                    var ind = nsb.getIndexByProperty(productsList, data, 'id');
                    if(ind>-1) productsList.splice(ind, 1);
                    funcFactory.showNotification("Удален продукт", 'Продукт удален другим пользователем.');
                }
            }
        };

        return nsb.build(module, 'customerOrdersNotifications', actions);
    }]);
}());