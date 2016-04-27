/**
 * Created by Egor Lobanov on 04.11.15.
 * Контроллер страицы просмотра продукта
 */
(function() {

    'use strict';

    angular.module('app.products').controller('ProductCtrl', ['$scope', '$stateParams', 'serverApi', '$state', 'funcFactory', '$uibModal', 'CanCan', 'FileUploader', function($scope, $stateParams, serverApi, $state, funcFactory, $uibModal, CanCan, FileUploader){
        var sc = $scope;

        sc.visual = {
            navButtsOptions:[{type:'edit', callback: goToEdit}, {type:'logs', callback: goToPartnerLogs},
                {type:'add', callback:appendProductToCustomerOrder}
            ],
            roles: {can_edit: CanCan.can('edit', 'Product')}
        };

        sc.tinymceOptions = funcFactory.getTinymceOptions();

        sc.product = {};// данные продукта
        sc.data = {
            quantity:0
        };

        sc.uploader = new FileUploader({
            withCredentials: true,
            queueLimit: 1,
            onCompleteItem: function(fileItem, response, status, headers) {
                if(status===200){
                    sc.product.image_url = response.image_url;
                    sc.uploader.clearQueue();
                    funcFactory.showNotification("Успешно", 'Изменил картинку.',true);
                } else {
                    funcFactory.showNotification('Не удалось изменить картинку', result.data.errors);
                }
            }
        });

        //получаем информацию о продукте при загрузке контроллера $stateParams.id - id продукта
        serverApi.getProduct($stateParams.id, function(result){
            sc.product = result.data;
            console.log(result.data);
            setFileUploadOptions(result.data);
        });

        function setFileUploadOptions(product){
            sc.uploader.url = 'http://www.texenergo.com/api/products/'+ product.id +'/image';
        }

        sc.getLeadTime = function(id, quantity){
            if(event.keyCode == 13){
                serverApi.getLeadTime(id, quantity, function(result){
                    var info = result.data.lead_time_info;
                    funcFactory.showNotification("Успешно", 'Тариф: ' + info.price_tarif + " руб., Скидка: " + info.discount + "%, Закупка: " + info.cost + " руб., Срок поставки: " + info.delivery_date + ", Мин. кол-во: " + info.quantity_min, true);
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

        function goToEdit(){
            $state.go('app.product.edit', $stateParams);
        }

        function goToPartnerLogs(){
            $state.go('app.product.partner_logs', $stateParams);
        }

        /**
         * Обновляем информацию по товару
         */
        sc.saveProduct = function(){
            var product = sc.product;
            var data = {
                    product:{
                        name: product.name,
                        description: product.description,
                        article: product.article,
                        manufacturer_id: product.manufacturer.id,
                        catalogue_ids: (product.catalogues || []).map(function(item){
                             return item.id;
                        })//,
                        // type: product.type.selected,
                        // unit: product.unit.selected,
                        // vat_rate: product.vat_rate.selected,
                        // weight: product.weight
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

        sc.changeManufacturer = function(){
            var modalInstance = $uibModal.open({
                templateUrl: 'spChangeManufacturerModal.tmpl.html',
                controller: 'productManufacturerModalCtrl',
                windowClass: 'eqo-centred-modal',
                resolve: {
                    product: sc.product.manufacturer
                }
            });

            modalInstance.result.then(function (selected) {
                sc.product.manufacturer = selected;
                sc.saveProduct();
            });
        };

        sc.changeCatalogues = function(){
            var modalInstance = $uibModal.open({
                templateUrl: 'spChangeCataloguesModal.tmpl.html',
                controller: 'productCatalogueModalCtrl',
                windowClass: 'eqo-centred-modal',
                resolve: {
                    data: { catalogues: sc.product.catalogues}
                }
            });

            modalInstance.result.then(function (selected) {
                sc.product.catalogues = selected;
                sc.saveProduct();
            });
        };

        sc.canEditProduct = function(){
            for(var i=0; i < gon.ability.rules.length; i++) {
                if(gon.ability.rules[i].subjects[0]==="Product") {
                    for (var j = 0; j <= gon.ability.rules[i].actions.length; j++) {
                        if (gon.ability.rules[j].actions[j]==="update") {
                            return true;
                        }
                    }
                }
                if(gon.ability.rules[i].subjects[0]==="all") {
                    return true;
                }
            }
            return false;
        }

    }]).controller('productManufacturerModalCtrl', ['$scope', 'serverApi', '$uibModalInstance', 'product', function(sc, serverApi, $uibModalInstance, product){
        sc.data = {
            manufacturer: product
        };
        sc.mSelectConfig = {
            dataMethod: serverApi.getManufacturers
        };
        sc.ok = function () {
            $uibModalInstance.close(sc.data.manufacturer);
        };
        sc.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }]).controller('productCatalogueModalCtrl', ['$scope', 'serverApi', '$uibModalInstance', 'data', function(sc, serverApi, $uibModalInstance, data){
        sc.data = {
            selected: data.catalogues,
            catalogues: []
        };
        sc.cselectConfig = {
            dataMethod: serverApi.getCatalogues
        };
        sc.ok = function () {
            $uibModalInstance.close(sc.data.selected);
        };
        sc.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }]);
}());