(function(){
    "use strict";

    angular.module('app.incoming_transfers').controller('LogsIncomingTransferCtrl', ['$state', '$stateParams', 'serverApi', function($state, $stateParams, serverApi) {
        var self = this;
        this.logs = [];

        this.visual = {
            navButtsOptions:[
                {
                    type: 'back',
                    callback: function() {
                        $state.go('app.incoming_transfers',{});
                    }
                },
                {
                    type: 'show',
                    callback: function() {
                        $state.go('app.incoming_transfers.view', $stateParams);
                    }
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

        serverApi.getIncomingTransferLogs($stateParams.id, function(result){
            self.logs = result.data;
        });
    }]);
}());
