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
                navButtsOptions:[
                    {
                        type:'add',
                        callback: function (productId) {
                            $uibModal.open({
                                component: 'productToCustomerOrderModal',
                                windowClass: 'eqo-centred-modal',
                                resolve: {product : {id: productId}}
                            });
                        }
                    },
                    {type:'view', callback: viewProduct}
                ]
            };

            sc.selectedRowIndex = -1;

            //add keydown listener to handle navigation inside results table
            angular.element(window).on('keydown', navigateInTable);

            sc.searchProduct = function(pageNumber, query, options, callback){
                serverApi.getSearch(pageNumber, query, options, callback);
            };

            sc.selectRow = function(index) {
                sc.selectedRowIndex = index;
            };

            /**
             * Открывает view с просмотром информации о продукте
             * @param id - id продукта информацию по которому необходимо посмотреть
             */
            function viewProduct(id) {
                $state.go('app.product', {id: id});
            }

            /**
             * Navigate inside the table via arrows.
             * Handler of keydown event.
             * If Enter pressed, then open product view
             * @param event
             */
            function navigateInTable (event) {
                const ARROW_UP = 38;
                const ENTER = 13;
                const ESCAPE = 27;
                const ARROW_DOWN = 40;

                var key = event.keyCode,
                    list = sc.data.searchList,
                    _window = angular.element(window),
                    scrollTop = _window.scrollTop(),
                    outerHeight = _window.outerHeight() + scrollTop;


                if(([ARROW_UP, ARROW_DOWN].indexOf(key) !== -1) && (list.length > 0)) {
                    //select row first time
                    if(sc.selectedRowIndex < 0){
                        sc.selectedRowIndex = 0;
                    } else {
                        var step = key === ARROW_UP ? -1 : 1,
                            newIndex = sc.selectedRowIndex + step;

                        if((newIndex > -1) && (newIndex < sc.data.searchList.length)) {
                            sc.selectedRowIndex = newIndex;

                            const selectedIndexPosition = angular.element('#top_search_table_body>tr')
                                .eq(sc.selectedRowIndex).offset();

                            if (selectedIndexPosition.top > outerHeight) {
                                _window.scrollTop(_window.scrollTop() + 200, 1000);
                            }

                            if (selectedIndexPosition.top < scrollTop) {
                                _window.scrollTop(_window.scrollTop() - 200, 1000);
                            }
                        }
                    }
                    //on hit Enter
                } else if((key === ENTER) && (list.length > 0) && (sc.selectedRowIndex > -1)) {

                    var selectedRow = list[sc.selectedRowIndex];
                    viewProduct(selectedRow._id || selectedRow.id);

                    // on Escape blur input
                } else if((key === ESCAPE) && (event.target.localName === 'input')) {
                    event.target.blur();
                }
            }

            //clear resources before scope will be destroyed
            sc.$on('$destroy', function() {
                angular.element(window).off('keydown', navigateInTable);
            });
        }]);
}());
