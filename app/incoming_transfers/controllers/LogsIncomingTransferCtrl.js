(function(){

    "use strict";

    angular.module('app.incoming_transfers').controller('LogsIncomingTransferCtrl', ['$scope', '$state', '$stateParams', 'serverApi', 'funcFactory', function($scope, $state, $stateParams, serverApi, funcFactory){
        var sc = $scope;
        sc.logs = {};
        sc.visual = {
            navButtsOptions:[{type:'back', callback:returnBack}, {type: 'show', callback: goToShow}],
            chartOptions: {
                barColor:'rgb(103,135,155)',
                scaleColor:false,
                lineWidth:5,
                lineCap:'circle',
                size:50
            }
        };

        serverApi.getIncomingTransferLogs($stateParams.id, function(result){
            var logs = sc.logs = result.data;
        });

        function goToShow(){
            $state.go('app.incoming_transfers.view', $stateParams);
        }
        
        function returnBack(){
            $state.go('app.incoming_transfers',{});
        }
        
    }]);
}());