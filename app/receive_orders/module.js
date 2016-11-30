angular.module('app.receive_orders', ['ui.router']).config($stateProvider => {
    $stateProvider.state('app.receive_orders', {
        url: '/receive_orders?q',
        data:{
            title: 'Поступление',
            access:{
                action:'index',
                params:'ReceiveOrder'
            }
        },
        params:{
            q:''
        },
        views:{
            "content@app": {
                template: '<receive-orders query="$resolve.query"></receive-orders>',
                resolve: {query: ['$stateParams', $stateParams => $stateParams.q]}
            }
        }
    }).state('app.receive_orders.view', {
        url: '/:id',
        data:{
            title: 'Просмотр поступления',
            access:{
                action: 'read',
                params:'ReceiveOrder'
            }
        },
        views:{
            "content@app":{
                controller: 'ViewReceiveOrderCtrl',
                templateUrl: '/app/receive_orders/views/viewReceiveOrder.html'
            }
        }
    }).state('app.receive_orders.view.logs', {
        url: '/logs',
        data:{
            title:'История поступления',
            access:{
                action:'logs',
                params:'ReceiveOrder'
            }
        },
        views:{
            "content@app":{
                controller: 'LogsReceiveOrderCtrl',
                templateUrl: '/app/receive_orders/views/logsReceiveOrder.html'
            }
        }
    });
});
