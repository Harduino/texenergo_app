/**
 * Created by Egor Lobanov on 02.11.15.
 * Контролер страницы поиска продуктов
 */
(function(){

        'use strict';

        angular.module('app.search').controller('TopSearchCtrl', ['$scope', '$stateParams', '$location', '$state', 'serverApi', 'CanCan', '$uibModal', function($scope, $stateParams, $location, $state, serverApi, CanCan, $uibModal){
            var sc = $scope;

            sc.data = {
                searchText: decodeURIComponent($stateParams.searchString), //содержимое сроки поиска в топ меню
                searchList: [] // массив с результатами поиска
            };
            sc.visual = {
                //контролы таблицы
                navButtsOptions:[
                    {type:'add', callback: addProductToCustomerOrderModal},
                    {type:'view', callback: viewProduct },
                    {type:'table_edit', callback: editProduct}
                ],
                role:{
                    can_edit: CanCan.can('Product', 'edit'),
                    can_destroy: CanCan.can('Product', 'destroy')
                }
            };
            
            /**
             * Открываем модальное окно, чтобы открыть список заказов и добавить товар
             * @param p - product
             */
            function addProductToCustomerOrderModal(product_id){
                var modalInstance = $uibModal.open({
                    templateUrl: 'eqoProductToCustomerOrderModal.tmpl.html',
                    controller: 'eqoProductToCustomerOrderModalCtrl',
                    windowClass: 'eqo-centred-modal',
                    resolve: {
                        product : {id: product_id},
                        config: {}
                    }
                });

            modalInstance.result.then(function (selectedProduct) {
                sc.saveProductSubstitute({id: p.id, quantity: p.quantity, product_id: (selectedProduct._id || selectedProduct.id)});
            });
        };

            /**
             * Открывает view с просмотром информации о продукте
             * @param id - id продукта информацию по которому необходимо посмотреть
             */
            function viewProduct(id){
                $state.go('app.product', {id: id});
            }
            
            /**
             * Открывает edit для редактирования товара
             * @param id - id продукта информацию по которому необходимо посмотреть
             */
            function editProduct(id){
                $state.go('app.product.edit', {id: id});
            }
        }]).controller("eqoProductToCustomerOrderModalCtrl", ['$scope', '$uibModalInstance', 'serverApi', 'product', 'config', 'funcFactory', function($scope, $uibModalInstance, serverApi, product, config, funcFactory){
            var sc = $scope;
            
//            sc.pSelectConfig = {
//                startPage: 0,
//                dataMethod: serverApi.getSearch
//            };
            sc.data = {
                product: product,
                quantity: null,
                customerOrdersList: []
            };
            sc.config = angular.extend({
                title: 'Добавить в заказ клиента',
//                btnOkText: 'Добавить',
                btnCancelText: 'Закрыть'
            }, config);

            // Добавляем товар в выбранный заказ
//            sc.ok = function () {
//                $uibModalInstance.close(sc.data.selectedProduct);
//            };

            // Закрыть модальное окно
            sc.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };
            
            serverApi.getCustomerOrders(0, null, {}, function(result){
                sc.data.customerOrdersList = result.data.filter(function(obj){
                    return obj.can_edit;
                });
            });
            
            sc.addProductToCustomerOrder = function(customer_order){
                var post = {
                    product_id: sc.data.product.id,
                    quantity: (sc.data.quantity || 1),
                };

                serverApi.addCustomerOrderProduct(customer_order.id, post, function(result){
                    if(!result.data.errors){
                        for(var i=0; i<sc.data.customerOrdersList.length; i++){
                            if(sc.data.customerOrdersList[i].number === customer_order.number) {
                                sc.data.customerOrdersList.splice(i, 1);
                                break;
                            }
                        }
                        funcFactory.showNotification('Успешно добавлен в заказ', customer_order.number, true);
                    } else {
                        funcFactory.showNotification('Не удалось добавить продукт', result.data.errors);
                    }
                });
            }
    }]);
}());
