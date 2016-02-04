/**
 * Created by Mikhail Arzhaev on 20.11.15.
 * Модуль страницы категорий товаров для каталога
 */

(function () {

    "use strict";
    var module = angular.module('app.manufacturers', ['ui.router']);

    module.config(function ($stateProvider) {
        $stateProvider.state('app.manufacturers', {
            url: '/manufacturers?q',
            data:{
                title: 'Производители',
                access:{
                    action:'index',
                    params:'Manufacturers'
                }
            },
            params:{
              q:''
            },
            views:{
                "content@app": {
                    controller: 'ManufacturersCtrl',
                    templateUrl: '/assets/admin/app/manufacturers/views/manufacturers.html'
                }
            }
        }).state('app.manufacturers.view', {
            url: '/:id',
            data:{
                title: 'Просмотр производителя',
                access:{
                    action:'read',
                    params:'Manufacturers'
                }
            },
            views:{
                "content@app":{
                    controller: 'ViewManufacturerCtrl',
                    templateUrl: '/assets/admin/app/manufacturers/views/viewManufacturer.html'
                }
            }
        }).state('app.manufacturers.view.edit', {
            url: '/edit',
            data:{
                title:'Редактирование производителя',
                access:{
                    action:'edit',
                    params:'Manufacturer'
                }
            },
            views:{
                "content@app":{
                    controller: 'EditManufacturerCtrl',
                    templateUrl: '/assets/admin/app/manufacturers/views/editManufacturer.html'
                }
            }
        });
    });
}());