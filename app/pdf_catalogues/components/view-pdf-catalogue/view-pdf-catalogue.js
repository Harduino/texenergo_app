class ViewPdfCatalogueCtrl {
    constructor($state, $stateParams, serverApi, funcFactory) {
        let self = this;
        this.serverApi = serverApi;
        this.funcFactory = funcFactory;

        this.pdfCatalogue = {};
        this.data = { manufacturersList: [] };
        this.manufacturerSelectConfig = { dataMethod: serverApi.getManufacturers };
        this.visual = {
            navButtsOptions:[
                {
                    type: 'back',
                    callback: () => $state.go('app.pdf_catalogues', {})
                },
                {
                    type: 'refresh',
                    callback: () => {
                        serverApi.getPdfCatalogueDetails($stateParams.id, r => self.pdfCatalogue = r.data);
                    }
                }
            ],
            chartOptions: {
                barColor:'rgb(103,135,155)',
                scaleColor:false,
                lineWidth:5,
                lineCap:'circle',
                size:50
            }
        };

        serverApi.getPdfCatalogueDetails($stateParams.id, r => {
            let catalogue = self.pdfCatalogue = r.data;
        });
    };

    savePdfCatalogue() {
        let self = this;
        let pdfCatalogue = this.pdfCatalogue;
        let data = { 
            pdf_catalogue: { 
                name: pdfCatalogue.name, 
                description: pdfCatalogue.description,
                manufacturer_id: pdfCatalogue.manufacturer.id
            }
        };

        self.serverApi.updatePdfCatalogue(pdfCatalogue.id, data, r => {
            if(r.status == 200 && !r.data.errors){
                self.funcFactory.showNotification('Успешно', 'Каталог ' + pdfCatalogue.name +
                    ' успешно отредактирован.', true);
            } else {
                self.funcFactory.showNotification('Неудача', 'Не удалось отредактировать каталог ' + pdfCatalogue.name,
                    true);
            }
        });
    }
};

ViewPdfCatalogueCtrl.$inject = ['$state', '$stateParams', 'serverApi', 'funcFactory'];
angular.module('app.pdf_catalogues').component('viewPdfCatalogue', {
    controller: ViewPdfCatalogueCtrl,
    controllerAs: 'viewPdfCatalogueCtrl',
    templateUrl: '/app/pdf_catalogues/components/view-pdf-catalogue/view-pdf-catalogue.html'
});