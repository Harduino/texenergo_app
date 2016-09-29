/**
 * Created by Egor Lobanov on 15.11.15.
 */

(function(){

    "use strict";

    angular.module('app.dispatch_orders').controller('LogsDispatchOrderCtrl', ['$scope', '$state', '$stateParams', 'serverApi', 'funcFactory', function($scope, $state, $stateParams, serverApi, funcFactory){
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

        serverApi.getDispatchOrderLogs($stateParams.id, function(result){
            var logs = sc.logs = result.data;
        });

        function goToShow(){
            $state.go('app.dispatch_orders.view', $stateParams);
        }
        
        function returnBack(){
            $state.go('app.dispatch_orders',{});
        }
        
    }]);
}());