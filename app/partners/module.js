angular.module('app.partners', ['ui.router'])
    .config($stateProvider => {
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
                    'content@app': {
                        template: '<partners></partners>'
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
                    'content@app': {
                        template: '<view-partner></view-partner>'
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
                    'content@app':{
                        template: '<logs-partner></logs-partner>'
                    }
                }
            })
        ;
    })
    .filter('innKpp', () => {
       return (inn, kpi) => {
           return inn && kpi ? inn.toString() + '/' + kpi.toString() : '';
       }
    })
;
