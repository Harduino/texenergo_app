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
                template: '<outgoing-transfers></outgoing-transfers>'
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
                template: '<view-outgoing-transfer></view-outgoing-transfer>'
            }
        }
    });
});
