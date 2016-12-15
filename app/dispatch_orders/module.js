angular.module('app.dispatch_orders', ['ui.router'])
    .config($stateProvider => {
        $stateProvider
            .state('app.dispatch_orders', {
                url: '/dispatch_orders?q',
                data:{
                    title: 'Списания',
                    access:{
                        action:'index',
                        params:'DispatchOrder'
                    }
                },
                params:{
                    q:''
                },
                views:{
                    'content@app': {
                        template: '<dispatch-orders></dispatch-orders>'
                    }
                }
            })
            .state('app.dispatch_orders.view', {
                url: '/:id',
                data:{
                    title: 'Просмотр списания',
                    access:{
                        action:'read',
                        params:'DispatchOrder'
                    }
                },
                views:{
                    'content@app':{
                        template: '<view-dispatch-order></view-dispatch-order>'
                    }
                }
            })
            .state('app.dispatch_orders.view.logs', {
                url: '/logs',
                data:{
                    title:'История списания',
                    access:{
                        action:'logs',
                        params:'DispatchOrder'
                    }
                },
                views:{
                    'content@app':{
                        controller: 'LogsDispatchOrderCtrl',
                        controllerAs: 'logsDispatchOrderCtrl',
                        templateUrl: '/app/dispatch_orders/views/logsDispatchOrder.html'
                    }
                }
            })
        ;
    })
;
