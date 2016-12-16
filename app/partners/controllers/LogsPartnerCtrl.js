(function(){
    "use strict";

    angular.module('app.partners').controller('LogsPartnerCtrl', ['$state', '$stateParams', 'serverApi', function($state, $stateParams, serverApi){
        var self = this;
        this.logs = {};

        this.visual = {
            navButtsOptions:[
                {
                    type: 'back',
                    callback: function() {
                        $state.go('app.partners', {});
                    }
                },
                {
                    type: 'show',
                    callback: function(){
                        $state.go('app.partners.view', $stateParams);
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

        serverApi.getPartnerLogs($stateParams.id, function(result) {
            self.logs = result.data;
        });
    }]);
}());
