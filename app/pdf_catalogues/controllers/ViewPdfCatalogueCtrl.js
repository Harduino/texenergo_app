/**
 * Created by Mikhail Arzhaev on 20.11.15.
 */
(function(){

    "use strict";

    angular.module('app.pdf_catalogues').controller('ViewPdfCatalogueCtrl', ['$scope', '$state', '$stateParams', 'serverApi', function($scope, $state, $stateParams, serverApi){
        var sc = $scope;
        sc.pdfCatalogue = {};
        sc.visual = {
            navButtsOptions:[{type:'back', callback:returnBack}],
            chartOptions: {
                barColor:'rgb(103,135,155)',
                scaleColor:false,
                lineWidth:5,
                lineCap:'circle',
                size:50
            }
        };

        serverApi.getPdfCatalogueDetails($stateParams.id, function(result){
            sc.pdfCatalogue = result.data;
        });

        function returnBack(){
            $state.go('app.pdf_catalogues',{});
        }
    }]);
}());