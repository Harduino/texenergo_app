class ViewProductCtrl {
    constructor($stateParams, serverApi, $state, funcFactory, $uibModal, FileUploader, $localStorage){
        let self = this;
        this.product = {};
        this.serverApi = serverApi;
        this.funcFactory = funcFactory;
        this.uibModal = $uibModal;
        this.state = $state;

        this.partnersList = [];
        this.manufacturerSelectConfig = {dataMethod: serverApi.getManufacturers};

        this.visual = {
            navButtsOptions:[
                {
                    type: 'logs',
                    callback: () => $state.go('app.product.logs', {})
                },
                { type: 'add', callback: appendProductToCustomerOrder }
            ]
        };

        this.tinymceOptions = funcFactory.getTinymceOptions();

        this.data = {
            quantity:0
        };

        this.uploader = new FileUploader({
            queueLimit: 1,
            onCompleteItem: (fileItem, response, status, headers) => {
                if(status===200){
                    self.product.image_url = response.image_url;
                    self.uploader.clearQueue();
                    funcFactory.showNotification("Успешно", 'Изменил картинку.', true);
                } else {
                    funcFactory.showNotification('Не удалось изменить картинку', result.data.errors, false);
                }
            }
        });

        var appendProductToCustomerOrder = product_id => {
            $uibModal.open({
                templateUrl: 'app/layout/partials/productToCustomerOrder.html',
                controller: 'productToCustomerOrderModalCtrl',
                windowClass: 'eqo-centred-modal',
                resolve: {
                    product : {id: product_id}
                }
            });
        }

        //получаем информацию о продукте при загрузке контроллера $stateParams.id - id продукта
        serverApi.getProduct($stateParams.id, r => {
            self.product = r.data;
            self.uploader.url = 'https://v2.texenergo.com/api/products/' + self.product.id + '/image?token=' + $localStorage.id_token;
        });
    }

    getLeadTime(id, quantity, event) {
        if(event.keyCode == 13){
            this.serverApi.getLeadTime(id, quantity, r => {
                var info = r.data.lead_time_info;
                if (window.yaCounter7987369 != undefined) {
                    var yaParams = {};
                    if ($localStorage && $localStorage.profile && $localStorage.profile.user_metadata) {
                        yaParams.user_email = $localStorage.profile.user_metadata.email;
                        yaParams.user_id = $localStorage.profile.user_metadata.contact_id;
                    }
                    yaCounter7987369.reachGoal("SeLeadTime", yaParams);
                }
                this.funcFactory.showNotification(
                    info.obsolete ? "Снят с производства" : "Успешно",
                    'Тариф: ' + info.price_tarif + " руб., Скидка: " + info.discount + "%, Закупка: " + info.cost + " руб., Срок поставки: " + info.delivery_date + ", Мин. кол-во: " + info.quantity_min + ", Остаток у Шнейдера: " + info.schneider_stock,
                    !info.obsolete
                );
            });
        }
    };

    saveProduct() {
        var product = this.product;
        var data = {
            product:{
                name: product.name,
                description: product.description,
                article: product.article,
                manufacturer_id: product.manufacturer.id,
                catalogue_ids: (product.catalogues || []).map( i => { return i.id; } )
            }
        };
        this.serverApi.updateProduct(product.id, data, r => {
            if(!r.data.errors){
                this.funcFactory.showNotification("Успешно", 'Товар ' + product.name + ' успешно отредактирована.', true);
            } else {
                this.funcFactory.showNotification('Не удалось отредактировать категорию ' + product.name, r.data.errors);
            }
        });
    };

    goToManufacturer() {
        this.state.go('app.manufacturers.view', {id: this.product.manufacturer.id});
    }

    changeCatalogues() {
        var modalInstance = $uibModal.open({
            templateUrl: 'spChangeCataloguesModal.tmpl.html',
            controller: 'productCatalogueModalCtrl',
            windowClass: 'eqo-centred-modal',
            resolve: {
                data: { catalogues: self.product.catalogues}
            }
        });

        modalInstance.result.then( selected => {
            self.product.catalogues = selected;
            self.saveProduct();
        });
    };

    // Persists a product obsolete by sending request to server
    makeObsolete(enable, r_id) {
        var product = self.product;
        var data = {
                product:{
                    obsolete: {
                        // Historically this one is called 'enable' on server side.
                        // Could handle and translate from 'flag' on server side, but leaving on client side until the issue escalates
                        enable: enable,
                        replacement_id :r_id
                    }
                }
            };
        this.serverApi.updateProduct(product.id, data, result => {
            if(!result.data.errors){
                self.product = result.data;
                this.funcFactory.showNotification("Успешно", 'Товар '+product.name+' успешно отредактирована.',true);
            } else {
                this.funcFactory.showNotification('Не удалось отредактировать категорию '+product.name, result.data.errors);
            }
        });
    };

    selectReplacementProduct() {
        var modalInstance = $uibModal.open({
            templateUrl: 'spChangeReplacementProduct.tmpl.html',
            controller: 'spChangeReplacementProductModalCtrl',
            windowClass: 'eqo-centred-modal',
            resolve: {
                product : self.product.obsolete
            }
        });

        modalInstance.result.then( selectedProduct => {
            self.makeObsolete(true, selectedProduct.id);
        });
    }
    
}

ViewProductCtrl.$inject = ['$stateParams', 'serverApi', '$state', 'funcFactory', '$uibModal', 'FileUploader', '$localStorage'];
angular.module('app.products').component('viewProduct', {
    controller: ViewProductCtrl,
    controllerAs: 'viewProductCtrl',
    templateUrl: 'app/products/components/view-product/view-product.html'
});

// class ProductCatalogueModalCtrl {
//     constructor(serverApi, $uibModalInstance, data){
//         let self = this;
//         this.data = {
//             selected: data.catalogues,
//             catalogues: []
//         };
//         this.cselectConfig = {
//             dataMethod: serverApi.getCatalogues
//         };
//         this.ok = () => $uibModalInstance.close(self.data.selected);
//         this.cancel = () => $uibModalInstance.dismiss('cancel');
//     }
// }

// ProductCatalogueModalCtrl.$inject = ['serverApi', '$uibModalInstance', 'data'];
// angular.module('app.product').controller('productCatalogueModalCtrl', ProductCatalogueModalCtrl);

// class SpChangeReplacementProductModalCtrl{
//     constructor(serverApi, $uibModalInstance, product){
//         let self = this;

//         this.pSelectConfig = {
//             startPage: 0,
//             dataMethod: serverApi.getSearch
//         };
//         this.data = {
//             selectedProduct: product,
//             productsList: []
//         };

//         this.ok = () => $uibModalInstance.close(self.data.selectedProduct);
//         this.cancel = () => $uibModalInstance.dismiss('cancel');
//     }
// }

// SpChangeReplacementProductModalCtrl.$inject = ['serverApi', '$uibModalInstance', 'product'];
// angular.module('app.product').controller('spChangeReplacementProductModalCtrl', SpChangeReplacementProductModalCtrl);