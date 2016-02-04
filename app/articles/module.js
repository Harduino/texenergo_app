/**
 * Created by Mikhail Arzhaev on 24.12.15.
 */

(function () {

    "use strict";
    var module = angular.module('app.articles', ['ui.router']);

    module.config(function ($stateProvider) {
        $stateProvider.state('app.articles', {
            url: '/articles?q',
            data:{
                title: 'Статья',
                access:{
                    action:'index',
                    params:'Article'
                }
            },
            params:{
              q:''
            },
            views:{
                "content@app": {
                    controller: 'ArticlesCtrl',
                    templateUrl: '/assets/admin/app/articles/views/articles.html'
                }
            }
        });
    });
}());