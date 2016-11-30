angular.module('app.outgoing_transfers', ['ui.router']).config($stateProvider => {
    $stateProvider.state('app.outgoing_transfers', {
        url: '/outgoing_transfers?q',
        data:{
            title: 'Исходящие платежи',
            access:{
                action:'index',
                params:'OutgoingTransfer'
            }
        },
        params:{
            q:''
        },
        views:{
            "content@app": {
                template: '<outgoing-transfers query="$resolve.query"></outgoing-transfers>',
                resolve: {query: ['$stateParams', $stateParams => $stateParams.q]}
            }
        }
    }).state('app.outgoing_transfers.view', {
        url: '/:id',
        data:{
            title: 'Просмотр исходящего платежа',
            access:{
                action:'read',
                params:'OutgoingTransfer'
            }
        },
        views:{
            "content@app":{
                controller: 'ViewOutgoingTransferCtrl',
                templateUrl: '/app/outgoing_transfers/views/viewOutgoingTransfer.html'
            }
        }
    });
});
