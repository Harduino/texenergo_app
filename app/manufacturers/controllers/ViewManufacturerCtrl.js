/**
 * Created by Mikhail Arzhaev on 20.11.15.
 */
(function(){

    "use strict";

    angular.module('app.manufacturers').controller('ViewManufacturerCtrl', ['$scope', '$state', '$stateParams', 'serverApi', '$sce', function($scope, $state, $stateParams, serverApi, $sce){
        var sc = $scope;
        sc.manufacturer = {};
        sc.visual = {
            navButtsOptions:[{type:'back', callback:returnBack}, {type:'edit', callback:editManufacturer}],
            chartOptions: {
                barColor:'rgb(103,135,155)',
                scaleColor:false,
                lineWidth:5,
                lineCap:'circle',
                size:50
            }
        };

        serverApi.getManufacturerDetails($stateParams.id, function(result){
            sc.manufacturer = result.data;
            sc.manufacturer.description = $sce.trustAsHtml(result.data.description);
        });

        function returnBack(){
            $state.go('app.manufacturers',{});
        }
        function editManufacturer(){
            $state.go('app.manufacturers.view.edit',$stateParams);
        }
    }]);
}());