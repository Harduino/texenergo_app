angular.module('app.dispatch_orders', ['ui.router'])
    .config($stateProvider => {
        $stateProvider
            .state('app.dispatch_orders', {
                url: '/dispatch_orders?q&status',
                data:{
                    title: 'Списания',
                    access:{
                        action:'index',
                        params:'DispatchOrder'
                    }
                },
                params:{
                    q:'',
                    status:''
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
                        template: '<logs-dispatch-order></logs-dispatch-order>'
                    }
                }
            })
        ;
    })
;
