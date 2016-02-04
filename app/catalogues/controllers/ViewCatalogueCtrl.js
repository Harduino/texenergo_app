/**
 * Created by Egor Lobanov on 15.11.15.
 */
(function(){

    "use strict";

    angular.module('app.catalogues').controller('ViewCatalogueCtrl', ['$scope', '$state', '$stateParams', 'serverApi', '$sce', function($scope, $state, $stateParams, serverApi, $sce){
        var sc = $scope;
        sc.catalogue = {};
        sc.visual = {
            navButtsOptions:[{type:'back', callback:returnBack},{type:'edit', callback:editCatalogue}],
            chartOptions: {
                barColor:'rgb(103,135,155)',
                scaleColor:false,
                lineWidth:5,
                lineCap:'circle',
                size:50
            }
        };

        serverApi.getCatalogueDetails($stateParams.id, function(result){
            console.log(result.data);
            sc.catalogue = result.data;
            sc.catalogue.description = $sce.trustAsHtml(result.data.description);
        });

        function returnBack(){
            $state.go('app.catalogues',{});
        }
        
        function editCatalogue(){
            $state.go('app.catalogues.view.edit',$stateParams);
        }
    }]);
}());