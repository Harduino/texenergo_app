/**
 * Created by Mikhail Arzhaev on 07.12.15.
 */
(function(){
    angular.module('app.products').controller('EditProductCtrl', ['$scope', '$state', '$stateParams', 'serverApi', 'funcFactory', 'FileUploader', function($scope, $state, $stateParams, serverApi, funcFactory, FileUploader){
        var sc = $scope;
        sc.data ={
            product:{},
            manufacturers:[],
            catalogues:[]
        };
        sc.visual = {
            navButtsOptions:[{type:'show', callback:goToShow}],
            roles:{}
        };

        sc.tinymceOptions = funcFactory.getTinymceOptions();
        //manufacture select options
        sc.mSelectConfig = {
            dataMethod: serverApi.getManufacturers
        };
        //category select options
        sc.cselectConfig = {
            dataMethod: serverApi.getCatalogues
        };

        serverApi.getProduct($stateParams.id, function(result){
            var product = sc.data.product = result.data;
            product.vat_rate.selected = product.vat_rate.selected.toString();// to let 'select' set selected option from model
            sc.visual.roles = {
                can_edit: product.can_edit,
                can_destroy: product.can_destroy
            };
            setFileUploadOptions(product);
        });
        
        sc.uploader = new FileUploader({
            withCredentials: true,
            queueLimit: 1,
            onCompleteItem: function(fileItem, response, status, headers) {
                if(status===200){
                    sc.data.product.image_url = response.image_url;
                    sc.uploader.clearQueue();
                    funcFactory.showNotification("Успешно", 'Изменил картинку.',true);
                } else {
                    funcFactory.showNotification('Не удалось изменить картинку', result.data.errors);   
                }
            }
        });
        
        function setFileUploadOptions(product){
            sc.uploader.url = 'http://www.texenergo.com/api/products/'+ product.id +'/image';
        }

        /**
         * Обновляем информацию по категории
         */
        sc.saveProduct = function(){
            var product = sc.data.product;
            var data = {
                    product:{
                        name: product.name,
                        description: product.description,
                        article: product.article,
                        manufacturer_id: product.manufacturer.id,
                        catalogue_ids: (product.catalogues || []).map(function(item){
                            return item.id;
                        }),
                        type: product.type.selected,
                        unit: product.unit.selected,
                        vat_rate: product.vat_rate.selected,
                        weight: product.weight
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

        function goToShow(){
            $state.go('app.product', $stateParams);
        }
    }]);
}());