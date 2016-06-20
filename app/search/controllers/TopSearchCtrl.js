/**
 * Created by Egor Lobanov on 02.11.15.
 * Контролер страницы поиска продуктов
 */
(function(){

        'use strict';

        angular.module('app.search').controller('TopSearchCtrl', ['$scope', '$stateParams', '$location', '$state', 'serverApi', 'CanCan', '$uibModal', '$filter', function($scope, $stateParams, $location, $state, serverApi, CanCan, $uibModal, $filter){
            var sc = $scope;

            sc.data = {
                searchText: decodeURIComponent($stateParams.searchString), //содержимое сроки поиска в топ меню
                searchList: [], // массив с результатами поиска
                subSearch: {}
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

            sc.searchProduct = function(pageNumber, query, options, callback){
                serverApi.getSearch(pageNumber, query, options, callback);
                serverApi.getSubSearch(query, options, function(result){
                    sc.data.subSearch = result.data;
                    var s = sc.data.subSearch;
                    s.hasOwnProperty('properties') && angular.forEach(s.properties, function(item){
                        if(item.hasOwnProperty('min') && item.hasOwnProperty('max')) {
                            item.from = item.min * 1.2;
                            item.to = item.max * 0.8;
                            item.uiElement = {
                                type: "double",
                                min: item.min,
                                max: item.max,
                                from: item.from,
                                to: item.to,
                                grid: true,
                                step:1,
                                onFinish: function(data){
                                    item.from = data.from;
                                    item.to = data.to;
                                },
                                prettify: function (num){
                                    return $filter('number')(num, 2);
                                }
                            };
                        }
                    });
                });
            };

            sc.searchByFunctor = function(){
                var s = sc.data.subSearch;

                if(s.hasOwnProperty('properties')){

                    var props= '';

                    sc.searchProduct = null;

                    angular.forEach(s.properties, function(item){
                        var t = '&properties['+item.name+']';
                        if(item.hasOwnProperty('max') && item.hasOwnProperty('min')){
                            props += t + '[min]=' + item.from.toFixed(2) + t + '[max]=' + item.to.toFixed(2);
                        }
                        if(item.hasOwnProperty('options')){
                            if(item.val !== undefined)
                            props += t + '=' + item.val;
                        }
                    });

                    serverApi.getSearchFunctor(s.name, props, function(result){
                        if(result.status === 200){
                            sc.data.searchList = result.data;
                        }
                    });
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
