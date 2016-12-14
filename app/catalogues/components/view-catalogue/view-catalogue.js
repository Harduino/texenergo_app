class ViewCatalogueCtrl {
    constructor($state, $stateParams, serverApi, $sce) {
        let self = this;
        this.catalogue = {};

        this.visual = {
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
            self.catalogue = result.data;
            self.catalogue.description = $sce.trustAsHtml(result.data.description);
        });
    }
}

ViewCatalogueCtrl.$inject = ['$state', '$stateParams', 'serverApi', '$sce'];

angular.module('app.catalogues').component('viewCatalogue', {
    controller: ViewCatalogueCtrl,
    controllerAs: 'viewCatalogueCtrl',
    templateUrl: '/app/catalogues/components/view-catalogue/view-catalogue.html'
});
