/**
 * Created by Mikhail Arzhaev on 24.12.15.
 */

(function () {

    "use strict";
    var module = angular.module('app.news', ['ui.router']);

    module.config(function ($stateProvider) {
        $stateProvider.state('app.news', {
            url: '/news?q',
            data:{
                title: 'Новости',
                access:{
                    action:'index',
                    params:'News'
                }
            },
            params:{
              q:''
            },
            views:{
                "content@app": {
                    controller: 'NewsCtrl',
                    templateUrl: '/assets/admin/app/news/views/news.html'
                }
            }
        });
    });
}());