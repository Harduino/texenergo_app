class ViewCatalogueCtrl {
    constructor($scope, $state, $stateParams, serverApi, $sce) {
        $scope.catalogue = {};

        $scope.visual = {
            navButtsOptions:[
                {type: 'back', callback: () => $state.go('app.catalogues', {})},
                {type: 'edit', callback: () => $state.go('app.catalogues.view.edit', $stateParams)}
            ],
            chartOptions: {
                barColor: 'rgb(103,135,155)',
                    scaleColor: false,
                    lineWidth: 5,
                    lineCap: 'circle',
                    size: 50
            }
        };

        serverApi.getCatalogueDetails($stateParams.id, result => {
            $scope.catalogue = result.data;
            $scope.catalogue.description = $sce.trustAsHtml(result.data.description);
        });
    }
}

ViewCatalogueCtrl.$inject = ['$scope', '$state', '$stateParams', 'serverApi', '$sce'];
angular.module('app.catalogues').controller('ViewCatalogueCtrl', ViewCatalogueCtrl);
