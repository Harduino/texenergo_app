(function(){

    "use strict";

    angular.module('app.receive_orders').controller('LogsReceiveOrderCtrl', ['$state', '$stateParams', 'serverApi', 'funcFactory', function($state, $stateParams, serverApi, funcFactory){
        var self = this;
        this.logs = {};

        this.visual = {
            navButtsOptions:[
                {
                    type: 'back',
                    callback: () => $state.go('app.receive_orders', {})
                },
                {
                    type: 'show',
                    callback: () => $state.go('app.receive_orders.view', $stateParams)
                }
            ],
            chartOptions: {
                barColor:'rgb(103,135,155)',
                scaleColor:false,
                lineWidth:5,
                lineCap:'circle',
                size:50
            }
        };

        serverApi.getReceiveOrderLogs($stateParams.id, function(result){
            self.logs = result.data;
            
        });

    }]);
}());