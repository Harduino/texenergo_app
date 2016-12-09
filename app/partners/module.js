angular.module('app.partners', ['ui.router'])
    .config(function ($stateProvider) {
        $stateProvider
            .state('app.partners', {
                url: '/partners?q',
                data: {
                    title: 'Партнёры',
                    access: {
                        action: 'index',
                        params: 'Partner'
                    }
                },
                params: {
                  q: ''
                },
                views:{
                    "content@app": {
                        controller: 'PartnersCtrl',
                        controllerAs: 'partnersCtrl',
                        templateUrl: '/app/partners/views/partners.html'
                    }
                }
            })
            .state('app.partners.view', {
                url: '/:id',
                data: {
                    access: {
                        action: 'show',
                        params: 'Partner'
                    }
                },
                views:{
                    "content@app": {
                        controller: 'ViewPartnerCtrl',
                        templateUrl: '/app/partners/views/showPartner.html'
                    }
                }
            })
            .state('app.partners.view.logs', {
                url: '/logs',
                data: {
                    title: 'История партнёра',
                    access: {
                        action: 'logs',
                        params: 'Partner'
                    }
                },
                views:{
                    "content@app":{
                        controller: 'LogsPartnerCtrl',
                        templateUrl: '/app/partners/views/logsPartner.html'
                    }
                }
            })
        ;
    })
    .filter('innKpp', function() {
       return function(inn, kpi) {
           return inn && kpi ? inn.toString() + '/' + kpi.toString() : '';
       }
    })
;
