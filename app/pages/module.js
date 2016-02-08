/**
 * Created by Mikhail Arzhaev on 24.12.15.
 */

(function () {

    "use strict";
    var module = angular.module('app.pages', ['ui.router']);

    module.config(function ($stateProvider) {
        $stateProvider.state('app.pages', {
            url: '/pages?q',
            data:{
                title: 'Статичные страницы',
                access:{
                    action:'index',
                    params:'Page'
                }
            },
            params:{
              q:''
            },
            views:{
                "content@app": {
                    controller: 'PagesCtrl',
                    templateUrl: '/app/pages/views/pages.html'
                }
            }
        }).state('app.pages.view', {
            url: '/:id',
            data:{
                access:{
                    action:'read',
                    params:'Page'
                }
            },
            views:{
                "content@app":{
                    controller: 'ViewPageCtrl',
                    templateUrl: '/app/pages/views/viewPage.html'
                }
            }
        }).state('app.pages.edit', {
            url: '/edit',
            data:{
                title: 'Изменить страницу',
                access:{
                    action:'edit',
                    params:'Page'
                }
            },
            params:{
              q:''
            },
            views:{
                "content@app": {
                    controller: 'EditPageCtrl',
                    templateUrl: '/app/pages/views/editPage.html'
                }
            }
        });
    });
}());