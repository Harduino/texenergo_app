/**
 * Created by Egor Lobanov on 15.11.15.
 */

(function(){
    "use strict";

    angular.module('app.dispatch_orders').controller('LogsDispatchOrderCtrl', ['$state', '$stateParams', 'serverApi', function($state, $stateParams, serverApi) {
        var self = this;
        this.logs = {};

        this.visual = {
            navButtsOptions:[
                {
                    type: 'back',
                    callback: function() {
                        $state.go('app.dispatch_orders',{});
                    }
                },
                {
                    type: 'show',
                    callback: function() {
                        $state.go('app.dispatch_orders.view', $stateParams);
                    }
                }
            ],
            chartOptions: {
                barColor: 'rgb(103,135,155)',
                scaleColor: false,
                lineWidth: 5,
                lineCap: 'circle',
                size: 50
            }
        };

        serverApi.getDispatchOrderLogs($stateParams.id, function(result) {
            self.logs = result.data;
        });
    }]);
}());
