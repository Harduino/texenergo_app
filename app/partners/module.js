/**
 * Created by Egor Lobanov on 17.11.15.
 * Модуль страницы "Партнер"
 */
(function (){

    "use strict";

    var module = angular.module('app.partners', ['ui.router']);

    module.config(function ($stateProvider) {
        $stateProvider.state('app.partners', {
            url: '/partners?q',
            data:{
                title: 'Партнёры',
                access:{
                    action:'index',
                    params:'Partner'
                }
            },
            params:{
              q:''
            },
            views:{
                "content@app": {
                    controller: 'PartnersCtrl',
                    templateUrl: '/app/partners/views/partners.html'
                }
            }
        }).state('app.partners.view', {
            url: '/:id',
            data:{
                access:{
                    action:'show',
                    params:'Partner'
                }
            },
            views:{
                "content@app":{
                    controller: 'ViewPartnerCtrl',
                    templateUrl: '/app/partners/views/showPartner.html'
                }
            }
        }).state('app.partners.view.logs', {
            url: '/logs',
            data:{
                title:'История партнёра',
                access:{
                    action:'logs',
                    params:'Partner'
                }
            },
            views:{
                "content@app":{
                    controller: 'LogsPartnerCtrl',
                    templateUrl: '/app/partners/views/logsPartner.html'
                }
            }
        });
    });

    module.filter('innKpp', function(){
       return function(inn, kpi){
           return inn && kpi ? inn.toString() + "/" + kpi.toString() : '';
       }
    });
}());