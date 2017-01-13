/**
 * Created by Egor Lobanov on 04.11.15.
 * Контроллер страицы просмотра продукта
 */
(function() {

    'use strict';

    angular.module('app.products').controller('ProductCtrl', ['$stateParams', 'serverApi', '$state', 'funcFactory', '$uibModal', 'FileUploader', '$localStorage', function($stateParams, serverApi, $state, funcFactory, $uibModal, FileUploader, $localStorage){
        var self = this;
        this.product = {};
        this.serverApi = serverApi;
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
            onCompleteItem: function(fileItem, response, status, headers) {
                if(status===200){
                    self.product.image_url = response.image_url;
                    self.uploader.clearQueue();
                    funcFactory.showNotification("Успешно", 'Изменил картинку.',true);
                } else {
                    funcFactory.showNotification('Не удалось изменить картинку', result.data.errors);
                }
            }
        });

        function setFileUploadOptions(product){
            self.uploader.url = 'https://v2.texenergo.com/api/products/' + product.id + '/image?token=' +
            $localStorage.id_token;
        }

        //получаем информацию о продукте при загрузке контроллера $stateParams.id - id продукта
        serverApi.getProduct($stateParams.id, r => {
            self.product = r.data;
            setFileUploadOptions(r.data);
        });

        

        this.getLeadTime = function(id, quantity, event){
            if(event.keyCode == 13){
                serverApi.getLeadTime(id, quantity, function(result){
                    var info = result.data.lead_time_info;
                    if (yaCounter7987369 != undefined) {
                        var yaParams = {};
                        if ($localStorage && $localStorage.profile && $localStorage.profile.user_metadata) {
                            yaParams.user_email = $localStorage.profile.user_metadata.email;
                            yaParams.user_id = $localStorage.profile.user_metadata.contact_id;
                        }
                        yaCounter7987369.reachGoal("SeLeadTime", yaParams)
                    }
                    funcFactory.showNotification(
                        info.obsolete ? "Снят с производства" : "Успешно",
                        'Тариф: ' + info.price_tarif + " руб., Скидка: " + info.discount + "%, Закупка: " + info.cost + " руб., Срок поставки: " + info.delivery_date + ", Мин. кол-во: " + info.quantity_min + ", Остаток у Шнейдера: " + info.schneider_stock,
                        !info.obsolete
                    );
                });
            }
        };

        function appendProductToCustomerOrder(product_id){
            $uibModal.open({
                templateUrl: 'app/layout/partials/productToCustomerOrder.html',
                controller: 'productToCustomerOrderModalCtrl',
                windowClass: 'eqo-centred-modal',
                resolve: {
                    product : {id: product_id}
                }
            });
        }

        /**
         * Обновляем информацию по товару
         */
        this.saveProduct = () => {
            var product = self.product;
            var data = {
                product:{
                    name: product.name,
                    description: product.description,
                    article: product.article,
                    manufacturer_id: product.manufacturer.id,
                    catalogue_ids: (product.catalogues || []).map( item => return item.id );
                }
            };
            serverApi.updateProduct(product.id, data, function(result){
                if(!result.data.errors){
                    funcFactory.showNotification("Успешно", 'Товар '+product.name+' успешно отредактирована.',true);
                } else {
                    funcFactory.showNotification('Не удалось отредактировать категорию '+product.name, result.data.errors);
                }
            });
        };

        this.changeManufacturer = function(){
            var modalInstance = $uibModal.open({
                templateUrl: 'spChangeManufacturerModal.tmpl.html',
                controller: 'productManufacturerModalCtrl',
                windowClass: 'eqo-centred-modal',
                resolve: {
                    product: self.product.manufacturer
                }
            });

            modalInstance.result.then(function (selected) {
                self.product.manufacturer = selected;
                self.saveProduct();
            });
        };

        this.changeCatalogues = function(){
            var modalInstance = $uibModal.open({
                templateUrl: 'spChangeCataloguesModal.tmpl.html',
                controller: 'productCatalogueModalCtrl',
                windowClass: 'eqo-centred-modal',
                resolve: {
                    data: { catalogues: self.product.catalogues}
                }
            });

            modalInstance.result.then(function (selected) {
                self.product.catalogues = selected;
                self.saveProduct();
            });
        };

        // Persists a product obsolete by sending request to server
        this.makeObsolete = function(enable, r_id){
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
            serverApi.updateProduct(product.id, data, function(result){
                if(!result.data.errors){
                    self.product = result.data;
                    funcFactory.showNotification("Успешно", 'Товар '+product.name+' успешно отредактирована.',true);
                } else {
                    funcFactory.showNotification('Не удалось отредактировать категорию '+product.name, result.data.errors);
                }
            });
        };

        this.selectReplacementProduct = function(){
            var modalInstance = $uibModal.open({
                templateUrl: 'spChangeReplacementProduct.tmpl.html',
                controller: 'spChangeReplacementProductModalCtrl',
                windowClass: 'eqo-centred-modal',
                resolve: {
                    product : self.product.obsolete
                }
            });

            modalInstance.result.then(function (selectedProduct) {
                self.makeObsolete(true, selectedProduct.id);
            });
        }

    }]).controller('productManufacturerModalCtrl', ['serverApi', '$uibModalInstance', 'product', function(serverApi, $uibModalInstance, product){
        var self = this;
        this.data = {
            manufacturer: product
        };
        this.mSelectConfig = {
            dataMethod: serverApi.getManufacturers
        };
        this.ok = function () {
            $uibModalInstance.close(self.data.manufacturer);
        };
        this.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }]).controller('productCatalogueModalCtrl', ['serverApi', '$uibModalInstance', 'data', function(serverApi, $uibModalInstance, data){
        var self = this;
        this.data = {
            selected: data.catalogues,
            catalogues: []
        };
        this.cselectConfig = {
            dataMethod: serverApi.getCatalogues
        };
        this.ok = function () {
            $uibModalInstance.close(self.data.selected);
        };
        this.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }]).controller("spChangeReplacementProductModalCtrl", ['$uibModalInstance', 'serverApi', 'product', function($uibModalInstance, serverApi, product){
        var self = this;

        this.pSelectConfig = {
            startPage: 0,
            dataMethod: serverApi.getSearch
        };
        this.data = {
            selectedProduct: product,
            productsList: []
        };

        this.ok = function () {
            $uibModalInstance.close(self.data.selectedProduct);
        };

        this.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }]);
}());