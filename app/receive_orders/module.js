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
                template: '<receive-orders></receive-orders>'
            }
        }
    }).state('app.receive_orders.view', {
        url: '/:id',
        data:{
            title: 'Просмотр поступления',
            access:{
                action: 'read'
            }
        },
        views:{
            "content@app":{
                template: '<view-receive-order></view-receive-order>'
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
                template: '<logs-receive-order></logs-receive-order>'
            }
        }
    });
});
