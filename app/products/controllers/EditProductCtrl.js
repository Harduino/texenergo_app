/**
 * Created by Mikhail Arzhaev on 07.12.15.
 */
(function(){
    angular.module('app.products').controller('EditProductCtrl', ['$scope', '$state', '$stateParams', 'serverApi', 'funcFactory', function($scope, $state, $stateParams, serverApi, funcFactory){
        var sc = $scope;
        sc.data ={
            product:{},
            manufacturers:[],
            catalogues:[]
        };
        sc.visual = {
            navButtsOptions:[{type:'show', callback:goToShow}],
            roles:{},
            showFileModal: angular.noop
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
            console.log(result.data);
            var product = sc.data.product = result.data;
            product.vat_rate.selected = product.vat_rate.selected.toString();// to let 'select' set selected option from model
            sc.visual.roles = {
                can_edit: product.can_edit,
                can_destroy: product.can_destroy
            };

            setFileWorkerOptions(product);
        });

        function setFileWorkerOptions(product){
            sc.fileModalOptions={
                url: '/api/products/'+ product.id +'/image',
                files: [product.image],
                r_delete: serverApi.deleteImage,
                view: 'products',
                id: product.id,
                filesCount:1,
                sending: function(file, xhr, formData){
                    var f = this.serverFiles,
                        files = this.files;

                    if(f.length>0 && f[0]) {
                        this.removeFile(f[0]);
                        f.splice(0,1);
                    }
                    files.length>1 && this.removeFile(files[0]);

                    //append title to formData before send
                    formData.append("title", file.title);
                },
                complete: function(file){
                    product.image_url = appConfig.serverUrl + '/uploads/'+ file.id + '/original' + this.cutExtension(file.name).extension;
                    !sc.$$phase && sc.$apply(angular.noop);
                },
                dropzoneConfig: {
                    acceptedFiles: '.jpg,.png,.gif,.jpeg'
                }
            };
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
                console.log(result);
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