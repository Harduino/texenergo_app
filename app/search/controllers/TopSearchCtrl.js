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
                    {type:'view', callback: viewProduct }
                ],
                role:{
                    can_destroy: CanCan.can('Product', 'destroy')
                }
            };
            
            /**
             * Открываем модальное окно, чтобы открыть список заказов и добавить товар
             * @param p - product
             */
            function addProductToCustomerOrderModal(product_id){
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
        }]);
}());
