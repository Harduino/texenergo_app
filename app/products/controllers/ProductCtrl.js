/**
 * Created by Egor Lobanov on 04.11.15.
 * Контроллер страицы просмотра продукта
 */
(function() {

    'use strict';

    angular.module('app.products').controller('ProductCtrl', ['$scope', '$stateParams', 'serverApi', '$state', 'funcFactory', '$uibModal', function($scope, $stateParams, serverApi, $state, funcFactory, $uibModal){
        var sc = $scope;

        sc.visual = {
            navButtsOptions:[{type:'edit', callback: goToEdit}, {type:'logs', callback: goToPartnerLogs},
                {type: 'at_partners', callback: goToSupplierInfos},
                {type:'add', callback:appendProductToCustomerOrder}
            ],
            roles: {}
        };

        sc.product = {};// данные продукта
        sc.data = {
            quantity:0
        };

        //получаем информацию о продукте при загрузке контроллера $stateParams.id - id продукта
        serverApi.getProduct($stateParams.id, function(result){
            sc.product = result.data;
            console.log(result.data);
        });

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

        function goToSupplierInfos(){
            $state.go('app.product.supplier_infos', $stateParams);
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
                        article: product.article//,
                        // manufacturer_id: product.manufacturer.id,
                        // catalogue_ids: (product.catalogues || []).map(function(item){
                        //     return item.id;
                        // }),
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
    }]);
}());