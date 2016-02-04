/**
 * Created by Egor Lobanov on 02.11.15.
 * Контролер страницы поиска продуктов
 */
(function(){

        'use strict';

        angular.module('app.search').controller('TopSearchCtrl', ['$scope', '$stateParams', '$location', '$state', 'serverApi', 'CanCan', function($scope, $stateParams, $location, $state, serverApi, CanCan){
            var sc = $scope;

            sc.data = {
                searchText: decodeURIComponent($stateParams.searchString), //содержимое сроки поиска в топ меню
                searchList: [] // массив с результатами поиска
            };
            sc.visual = {
                //контролы таблицы
                navButtsOptions:[
                    {type:'view', callback: viewProduct },
                    {type:'table_edit', callback: editProduct},
                    {type:'remove'}
                ],
                role:{
                    can_edit: CanCan.can('Product', 'edit'),
                    can_destroy: CanCan.can('Product', 'destroy')
                }
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
        }]);
}());
