angular.module('app.incoming_transfers', ['ui.router'])
    .config($stateProvider => {
        $stateProvider.state('app.incoming_transfers', {
            url: '/incoming_transfers?q',
            data:{
                title: 'Входящие платежи',
                access:{
                    action:'index',
                    params:'IncomingTransfer'
                }
            },
            params:{
                q:'',
                id:''
            },
            views:{
                "content@app": {
                    template: '<incoming-transfers></incoming-transfers>'
                }
            }
        }).state('app.incoming_transfers.view', {
            url: '/:id',
            data:{
                title: 'Просмотр входящего платежа',
                access:{
                    action:'read',
                    params:'IncomingTransfer'
                }
            },
            views:{
                "content@app":{
                    template: '<view-incoming-transfer></view-incoming-transfer>'
                }
            }
        }).state('app.incoming_transfers.view.logs', {
            url: '/logs',
            data:{
                title:'История поступления',
                access:{
                    action:'logs',
                    params:'IncomingTransfer'
                }
            },
            views:{
                "content@app":{
                    template: '<logs-incoming-transfer></logs-incoming-transfer>'
                }
            }
        });
    })
    .filter('f_incomingT', () => {
        return item => {
            if(item) {
                return item.hasOwnProperty('incoming_code') || (item.hasOwnProperty('type') && item.type.search(/transfer/gi) > -1)
                    ? '<i class="fa fa-rub" title="Платеж"></i> Платёж ' + (item.incoming_code || item.number)
                    : '<i class="fa fa-book" title="Заказ"></i> Заказ ' + item.number;
            }

            return '';
        };
    })
;
