angular.module('app.texts', ['ui.router'])
    .config($stateProvider => {
        $stateProvider
            .state('app.texts', {
                url: '/texts?q',
                data: {
                    title: 'Текстовые материлы',
                    access: {
                        action: 'index',
                        params: 'Text'
                    }
                },
                params: {
                  q: ''
                },
                views: {
                    'content@app': {
                        template: '<texts></texts>'
                    }
                }
            })
            .state('app.texts.view', {
                url: '/:id',
                data: {
                    access: {
                        action:'read',
                        params:'Text'
                    }
                },
                views: {
                    'content@app': {
                        template: '<view-text></view-text>'
                    }
                }
            })
        ;
    })
;
