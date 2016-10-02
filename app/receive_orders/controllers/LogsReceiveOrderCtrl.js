(function(){

    "use strict";

    angular.module('app.receive_orders').controller('LogsReceiveOrderCtrl', ['$scope', '$state', '$stateParams', 'serverApi', 'funcFactory', function($scope, $state, $stateParams, serverApi, funcFactory){
        var sc = $scope;
        sc.logs = {};
        sc.visual = {
            navButtsOptions:[
                { type: 'back', callback: returnBack },
                { type: 'show', callback: goToShow }
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
            var logs = sc.logs = result.data;
        });

        function goToShow(){
            $state.go('app.receive_orders.view', $stateParams);
        }
        
        function returnBack(){
            $state.go('app.receive_orders',{});
        }
        
    }]);
}());