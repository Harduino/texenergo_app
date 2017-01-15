class ViewPdfCatalogueCtrl {
    constructor($state, $stateParams, serverApi, funcFactory) {
        let self = this;
        this.serverApi = serverApi;
        this.funcFactory = funcFactory;

        this.pdfCatalogue = {};
        this.data = { manufacturersList: []};
        this.manufacturerSelectConfig = {dataMethod: self.serverApi.getManufacturers};

        // For adding product BEGIN
        this.addableQuery = "";
        this.addableProductsList = [];
        // For adding product END

        this.visual = {
            navButtsOptions:[
                {
                    type: 'back',
                    callback: () => $state.go('app.pdf_catalogues', {})
                },
                {
                    type: 'refresh',
                    callback: () => serverApi.getPdfCatalogueDetails($stateParams.id, r => self.pdfCatalogue = r.data)
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
            self.pdfCatalogue = r.data;
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
                self.funcFactory.showNotification(
                    'Успешно',
                    'Каталог ' + pdfCatalogue.name + ' успешно отредактирован.',
                    true
                );
            } else {
                self.funcFactory.showNotification(
                    'Неудача',
                    'Не удалось отредактировать каталог ' + pdfCatalogue.name,
                    true
                );
            }
        });
    }

    removeProduct(product) {
        let self = this;
        let pdfCatalogue = this.pdfCatalogue;

        self.serverApi.deletePdfCatalogueProduct(pdfCatalogue.id, product.id, r => {
            if(r.status == 200 && !r.data.errors) {
                self.funcFactory.showNotification('Успешно', 'Товар удалён', true);
                for (var i = 0; i < pdfCatalogue.products.length; i++) {
                    let prd = pdfCatalogue.products[i];
                    if (prd.id === product.id) pdfCatalogue.products.splice(i, 1);
                }
            } else {
                self.funcFactory.showNotification('Неудача', 'Товар не удалён', false);
            }
        })
    }

    // Searches for products to be added to pdfCatalogue
    // It filters to exclude already attached products.
    addableSearch() {
        let self = this;
        let query = self.addableQuery;

        if (query.length <= 1) {
            self.addableProductsList = [];
        } else {
            this.serverApi.getSearch(0, query, {}, r => self.addableProductsList = r.data.filter(alreadyAdded) );
        }
        var alreadyAdded = v => {
            for (var i = 0; i < self.pdfCatalogue.products.length; i++) {
                if (self.pdfCatalogue.products[i].id === v.id) return false;
            }
            return true;
        }
    }

    // Adds the product to the current pdfCatalogue
    addProduct(product) {
        let self = this;
        let pdfCatalogue = this.pdfCatalogue;
        let data = { product_id: product.id };

        self.serverApi.createPdfCatalogueProduct(pdfCatalogue.id, data, r => {
            if(r.status == 200 && !r.data.errors) {
                self.funcFactory.showNotification('Успешно', 'Товар добавлен', true);

                // Remove from searchable table
                for (var i = 0; i < self.addableProductsList.length; i++) {
                    if (self.addableProductsList[i].id === product.id) self.addableProductsList.splice(i, 1);
                }

                // Added to the persisted table
                self.pdfCatalogue.products.push(product);
            } else {
                self.funcFactory.showNotification('Неудача', 'Товар не добавлен', false);
            }
        })
    }
};

ViewPdfCatalogueCtrl.$inject = ['$state', '$stateParams', 'serverApi', 'funcFactory'];
angular.module('app.pdf_catalogues').component('viewPdfCatalogue', {
    controller: ViewPdfCatalogueCtrl,
    controllerAs: 'viewPdfCatalogueCtrl',
    templateUrl: '/app/pdf_catalogues/components/view-pdf-catalogue/view-pdf-catalogue.html'
});