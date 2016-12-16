class ViewManufacturerCtrl {
    constructor($state, $stateParams, serverApi, $sce) {
        let self = this;
        this.manufacturer = {};

        this.visual = {
            navButtsOptions:[
                {type: 'back', callback: () => $state.go('app.manufacturers', {})},
                {type: 'edit', callback: () => $state.go('app.manufacturers.view.edit', $stateParams)}
            ],
            chartOptions: {
                barColor: 'rgb(103,135,155)',
                scaleColor: false,
                lineWidth: 5,
                lineCap: 'circle',
                size: 50
            }
        };

        serverApi.getManufacturerDetails($stateParams.id, result => {
            self.manufacturer = result.data;
            self.manufacturer.description = $sce.trustAsHtml(result.data.description);
        });
    }
}

ViewManufacturerCtrl.$inject = ['$state', '$stateParams', 'serverApi', '$sce'];

angular.module('app.manufacturers').component('viewManufacturer', {
    controller: ViewManufacturerCtrl,
    controllerAs: 'viewManufacturerCtrl',
    templateUrl: '/app/manufacturers/components/view-manufacturer/view-manufacturer.html'
});
