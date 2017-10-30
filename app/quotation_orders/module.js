angular.module('app.quotation_orders', ['ui.router']).config($stateProvider => {
    $stateProvider.state('app.quotation_orders', {
        url: '/quotation_orders?q',
        data:{
            title: 'Рассчёты',
            access:{
                action:'index',
                params:'QuotationOrder'
            }
        },
        params:{
            q:''
        },
        views:{
            "content@app": {
                template: '<quotation-orders></quotation-orders>'
            }
        }
    }).state('app.quotation_orders.view', {
        url: '/:id',
        data:{
            title: 'Просмотр рассчёта',
            access:{
                action: 'read'
            }
        },
        views:{
            "content@app":{
                template: '<view-quotation-order></view-quotation-order>'
            }
        }
    });
});