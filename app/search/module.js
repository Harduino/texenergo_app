/**
 * Created by Egor Lobanov on 02.11.15.
 * Модуль поиска продуктов включает в себя маршруты к странице поиска
 * и странице просмотра продукта.
 */
(function () {

    "use strict";

    var module = angular.module('app.search', ['ui.router']);

    module.config(function ($stateProvider) {
        $stateProvider.state('app.search', {
            url:'/search=*searchString',
            params: {
                searchString:''
            },
            data: {
                title: 'Поиск'
            },
            views:{
                "content@app": {
                    controller: 'TopSearchCtrl',
                    templateUrl: '/assets/admin/app/search/views/search.html'
                }
            }
        });
    });
}());