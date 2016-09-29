(function(){

    "use strict";

    angular.module('app.partners').controller('LogsPartnerCtrl', ['$scope', '$state', '$stateParams', 'serverApi', 'funcFactory', function($scope, $state, $stateParams, serverApi, funcFactory){
        var sc = $scope;
        sc.logs = {};
        sc.visual = {
            navButtsOptions:[
                {type:'back', callback:returnBack},
                {type: 'show', callback: goToShow}
            ],
            chartOptions: {
                barColor:'rgb(103,135,155)',
                scaleColor:false,
                lineWidth:5,
                lineCap:'circle',
                size:50
            }
        };

        serverApi.getPartnerLogs($stateParams.id, function(result){
            var logs = sc.logs = result.data;
        });

        function goToShow(){
            $state.go('app.partners.view', $stateParams);
        }
        
        function returnBack(){
            $state.go('app.partners',{});
        }
        
    }]);
}());