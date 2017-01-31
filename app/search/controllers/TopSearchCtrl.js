/**
 * Created by Egor Lobanov on 02.11.15.
 * Контролер страницы поиска продуктов
 */
(function() {
        'use strict';

        angular.module('app.search').controller('TopSearchCtrl', ['$scope', '$stateParams', '$location', '$state', 'serverApi', '$uibModal', function(sc, $stateParams, $location, $state, serverApi, $uibModal){
            var self = this;
            this.data = {searchText: decodeURIComponent($stateParams.searchString), searchResults: [], subSearch: {}};

            this.visual = {
                navButtsOptions:[
                    {
                        type: 'add',
                        callback: function (productId) {
                            $uibModal.open({
                                component: 'productToCustomerOrderModal',
                                windowClass: 'eqo-centred-modal',
                                resolve: {product : {id: productId}}
                            });
                        }
                    },
                    {type: 'view', callback: viewProduct}
                ]
            };

            this.selectedRowIndex = -1;

            angular.element(window).on('keydown', navigateInTable);

            this.searchProduct = function (pageNumber, query, options, callback) {
                serverApi.getSearch(pageNumber, query, options, callback);
            };

            this.selectRow = function (index) {
                self.selectedRowIndex = index;
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
                    list = self.data.searchResults,
                    _window = angular.element(window),
                    scrollTop = _window.scrollTop(),
                    outerHeight = _window.outerHeight() + scrollTop;


                if (([ARROW_UP, ARROW_DOWN].indexOf(key) !== -1) && (list.length > 0)) {
                    //select row first time
                    if (self.selectedRowIndex < 0) {
                        self.selectedRowIndex = 0;
                    } else {
                        var step = key === ARROW_UP ? -1 : 1,
                            newIndex = self.selectedRowIndex + step;

                        if((newIndex > -1) && (newIndex < self.data.searchResults.length)) {
                            self.selectedRowIndex = newIndex;

                            const SELECTED_INDEX_POSITION = angular.element('#top_search_table_body>tr')
                                .eq(self.selectedRowIndex).offset();

                            if (SELECTED_INDEX_POSITION.top > outerHeight) {
                                _window.scrollTop(_window.scrollTop() + 200, 1000);
                            }

                            if (SELECTED_INDEX_POSITION.top < scrollTop) {
                                _window.scrollTop(_window.scrollTop() - 200, 1000);
                            }
                        }
                    }
                    //on hit Enter
                } else if ((key === ENTER) && (list.length > 0) && (self.selectedRowIndex > -1)) {

                    var selectedRow = list[self.selectedRowIndex];
                    viewProduct(selectedRow._id || selectedRow.id);

                    // on Escape blur input
                } else if ((key === ESCAPE) && (event.target.localName === 'input')) {
                    event.target.blur();
                }
            }

            sc.$on('$destroy', function() {
                angular.element(window).off('keydown', navigateInTable);
            });
        }]);
}());
