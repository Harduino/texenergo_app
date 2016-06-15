/**
 * Created by Mikhail Arzhaev on 19.11.15.
 * Модуль страницы заказов постащикам
 */

(function () {

    "use strict";
    var module = angular.module('app.supplier_orders', ['ui.router', 'easypiechart', 'services.notifications']);

    module.config(function ($stateProvider) {
        $stateProvider.state('app.supplier_orders', {
            url: '/supplier_orders?q',
            data:{
                title: 'Заказы поставщикам',
                access:{
                    action:'index',
                    params:'SupplierOrder'
                }
            },
            params:{
              q:''
            },
            views:{
                "content@app": {
                    controller: 'SupplierOrdersCtrl',
                    templateUrl: '/app/supplier_orders/views/supplierOrders.html'
                }
            }
        }).state('app.supplier_orders.view', {
            url: '/:id',
            data:{
                title: 'Просмотр заказа',
                access:{
                    action:'read',
                    params:'SupplierOrder'
                }
            },
            views:{
                "content@app":{
                    controller: 'ViewSupplierOrderCtrl',
                    templateUrl: '/app/supplier_orders/views/viewSupplierOrder.html'
                }
            }
        }).state('app.supplier_orders.view.edit', {
            url: '/edit',
            data:{
                title:'Редактирование заказа',
                access:{
                    action:'write',
                    params:'SupplierOrder'
                }
            },
            views:{
                "content@app":{
                    controller: 'EditSupplierOrderCtrl',
                    templateUrl: '/app/supplier_orders/views/editSupplierOrder.html'
                }
            }
        });
    });

    module.factory('supplierOrdersNotifications', ['notificationServiceBuilder', 'funcFactory', function(nsb, funcFactory){
        var actions = {
            // Обновить название, номер или тп по заказу
            update: function(localObject, serverResponse){
                var data = serverResponse.data;
                if( data !== undefined) {
                    for (var i = 0; i < Object.keys(data).length; i++) {
                        var k = Object.keys(data)[i];
                        var v = data[k];
                        localObject[k] = v;
                    }
                    funcFactory.showNotification("Обновил заказ", "Номер " + localObject.number +'.', true);
                } else if (serverResponse.errors !== undefined) {
                    funcFactory.showNotification("Ошибка при обновлении заказа", "Номер " + localObject.number +'. ' + serverResponse.errors, false);
                } else {
                    funcFactory.showNotification("Ошибка при обновлении заказа", "Номер " + localObject.number +'.', false);
                }
            },
            // Перещёлкнуть статус
            update_status: function(localObject, serverResponse){
                var data = serverResponse.data;
                if( data !== undefined) {
                    localObject.status = data.status;
                    localObject.can_edit = data.can_edit;
                    localObject.events = data.events;
                    funcFactory.showNotification("Обновил заказ", "Номер " + localObject.number +'.', true);
                } else if (serverResponse.errors !== undefined) {
                    funcFactory.showNotification("Ошибка при обновлении заказа", "Номер " + localObject.number +'. ' + serverResponse.errors, false);
                } else {
                    funcFactory.showNotification("Ошибка при обновлении заказа", "Номер " + localObject.number +'.', false);
                }
            },
            // Обновить строку с товаром
            update_content: function(localObject, serverResponse){
                var data = serverResponse.data;
                if( data !== undefined) {
                    var row;
                    for (var i = 0; i < localObject.supplier_order_contents.length; i++) {
                        if ( localObject.supplier_order_contents[i].id !== data.id )
                            continue
                        localObject.supplier_order_contents[i] = data;
                        break;
                    }
                    funcFactory.showNotification("Обновил товар", "Товар " + data.product.name +  " в заказе " + localObject.number +'.', true);
                } else if (serverResponse.errors !== undefined) {
                    funcFactory.showNotification("Ошибка при обновлении заказа", "Номер " + localObject.number +'. ' + serverResponse.errors, false);
                } else {
                    funcFactory.showNotification("Ошибка при обновлении заказа", "Номер " + localObject.number +'.', false);
                }
            },
            // Добавить товар
            create_content: function(localObject, serverResponse){
                var data = serverResponse.data;
                if( data !== undefined) {
                    // sc.productForAppend = {};
                    // sc.data.selectedProduct = null;
                    localObject.supplier_order_contents.push(data);
                    funcFactory.showNotification('Успешно добавлен продукт', data.product.name, true);
                    angular.element('#eso_prod_select').data().$uiSelectController.open=true;
                } else if (serverResponse.errors !== undefined) {
                    funcFactory.showNotification("Ошибка при добавлении товара", "Номер " + localObject.number +'. ' + serverResponse.errors, false);
                } else {
                    funcFactory.showNotification("Ошибка при добавлении товара", "Номер " + localObject.number +'.', false);
                }
            },
            // Удалить товар
            destroy_content: function(localObject, serverResponse){
                // var data = serverResponse.data;
                // var ind = nsb.getIndexByProperty(localObject, data, 'id');
                // if(ind>-1) localObject.splice(ind, 1);
                // funcFactory.showNotification("Удален продукт", 'Продукт удален другим пользователем.');
            }
        };

        return nsb.build(module, 'supplierOrdersNotifications', actions);
    }]);
}());