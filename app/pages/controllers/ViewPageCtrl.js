/**
 * Created by Mikhail Arzhaev 24.12.2015
 */
(function(){

    "use strict";

    angular.module('app.pages').controller('ViewPageCtrl', ['$scope', '$state', '$stateParams', 'serverApi', '$sce', function($scope, $state, $stateParams, serverApi, $sce){
        var sc = $scope;
        sc.page = {};
        sc.visual = {
            navButtsOptions:[{type:'back', callback:returnBack},{type:'edit', callback:editPage}],
            chartOptions: {
                barColor:'rgb(103,135,155)',
                scaleColor:false,
                lineWidth:5,
                lineCap:'circle',
                size:50
            }
        };

        serverApi.getPageDetails($stateParams.id, function(result){
            sc.page = result.data;
            sc.page.content = $sce.trustAsHtml(result.data.content);
        });

        function returnBack(){
            $state.go('app.pages',{});
        }
        
        function editPage(){
            $state.go('app.pages.view.edit',$stateParams);
        }
    }]);
}());