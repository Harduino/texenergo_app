/**
 * Created by Egor Lobanov on 02.11.15.
 * Контролер страницы поиска продуктов
 */
(function() {
        'use strict';

        angular.module('app.search').controller('TopSearchCtrl', ['$scope', '$stateParams', '$location', '$state', 'serverApi', '$uibModal', function(sc, $stateParams, $location, $state, serverApi, $uibModal){
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
                ]
            };

            sc.selectedRowIndex = -1;

            //add keydown listener to handle navigation inside results table
            angular.element(window).on('keydown', navigateInTable);

            sc.searchProduct = function(pageNumber, query, options, callback){
                serverApi.getSearch(pageNumber, query, options, callback);
            };

            sc.selectRow = function(index){
                sc.selectedRowIndex = index;
            };

            /**
             * Открываем модальное окно, чтобы открыть список заказов и добавить товар
             * @param productId - id продукта
             */
            function addProductToCustomerOrderModal(productId){
                $uibModal.open({
                    component: 'productToCustomerOrderModal',
                    windowClass: 'eqo-centred-modal',
                    resolve: {product : {id: productId}}
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
             * Navigate inside the table via arrows.
             * Handler of keydown event.
             * If Enter pressed, then open product view
             * @param event
             */
            function navigateInTable (event) {
                const up = 38;
                const enter = 13;
                const escape = 27;
                const down = 40;
                var key = event.keyCode,
                    list = sc.data.searchList,
                    _window = angular.element(window),
                    scrollTop = _window.scrollTop(),
                    outerHeight = _window.outerHeight() + scrollTop;


                if((key === up || key === down) && list.length>0){
                    //select row first time
                    if(sc.selectedRowIndex<0){
                        sc.selectedRowIndex = 0;
                    }else{
                        var step = key === up ? -1 : 1,
                            newIndex = sc.selectedRowIndex + step;

                        if(newIndex >-1 && newIndex<sc.data.searchList.length){
                            sc.selectedRowIndex = newIndex;

                            const selectedIndexPosition = angular.element('#top_search_table_body>tr').eq(sc.selectedRowIndex).offset();

                            if(selectedIndexPosition.top > outerHeight){
                                _window.scrollTop(_window.scrollTop() + 200, 1000);
                            }

                            if(selectedIndexPosition.top < scrollTop){
                                _window.scrollTop(_window.scrollTop() - 200, 1000);
                            }
                        }
                    }
                    //on hit Enter
                }else if(key === enter && list.length>0 && sc.selectedRowIndex > -1){

                    var selectedRow = list[sc.selectedRowIndex];
                    viewProduct(selectedRow._id || selectedRow.id);

                    // on Escape blur input
                } else if(key === escape && event.target.localName === 'input'){
                    event.target.blur();
                }
            }

            //clear resources before scope will be destroyed
            sc.$on('$destroy', function(){
                angular.element(window).off('keydown', navigateInTable);
            });
        }]);
}());
