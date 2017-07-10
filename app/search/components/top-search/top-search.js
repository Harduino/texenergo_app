class TopSearchCtrl {
    constructor($stateParams, $state, serverApi, $uibModal, funcFactory) {
        let self = this;
        this.serverApi = serverApi;
        this.$state = $state;
        this.funcFactory = funcFactory;

        this.selectedRowIndex = -1;
        this.data = {searchText: decodeURIComponent($stateParams.searchString), searchResults: [], subSearch: {}};

        this.visual = {
            navButtsOptions:[
                {
                    type: 'add',
                    callback: productId => {
                        $uibModal.open({
                            component: 'productToCustomerOrderModal',
                            windowClass: 'eqo-centred-modal',
                            resolve: {product : {id: productId}}
                        });
                    }
                },
                {
                    type: 'view',
                    callback: self.viewProduct.bind(self)
                },
                {
                    type:'remove',
                    callback: (item, button, $event) => {
                        $.SmartMessageBox({
                            title: 'Удалить товар?',
                            content: 'Вы действительно хотите удалить товар ' + item.data.name,
                            buttons: '[Нет][Да]'
                        }, ButtonPressed => {
                            if (ButtonPressed === 'Да') {
                                button.disableOnLoad(true, $event);
                                serverApi.deleteProduct(item.data.id, result => {
                                    button.disableOnLoad(false, $event);
                                    if(!result.data.errors){
                                        self.data.ordersList.splice(item.index,1);
                                        funcFactory.showNotification('Заказ ' + item.data.number + ' успешно удален.',
                                            '', true);
                                    } else {
                                        funcFactory.showNotification('Не удалось удалить заказ ' + item.data.number,
                                            result.data.errors);
                                    }
                                },() => {
                                  button.disableOnLoad(false, $event);
                                });
                            }
                        });
                    }
                }
            ]
        };

        this.getSearchProductHandler = this.getSearchProductHandler.bind(this);

        this.funcFactory.setPageTitle("Поиск: " + $stateParams.searchString);

        let tableNavigationHandler = self.navigateInTable.bind(self);
        angular.element(window).on('keydown', tableNavigationHandler);
        this.$onDestroy = () => angular.element(window).off('keydown', tableNavigationHandler);
    }

    // We are looking for popular document numbering pattern. If one is matched, then navigate there.
    // i.e. consider it a command instead of a search request.
    getSearchProductHandler (pageNumber, query, options, callback) {
        let self = this, orderTypeMatched = false;

        [
            {regExp: /р-\d{2}-[а-я]{2,4}-\d+/i, apiMethod: 'getDispatchOrders', state: 'app.dispatch_orders.view'},
            {regExp: /\d{2}-[а-я]{2,4}-\d+/i, apiMethod: 'getCustomerOrders', state: 'app.customer_orders.view'}
        ].forEach(orderCheckData => {
            if(!orderTypeMatched && orderCheckData.regExp.test(query)) {
                orderTypeMatched = true;
                self.redirectToOrder(query.match(orderCheckData.regExp)[0], orderCheckData.apiMethod, orderCheckData.state);
            }
        });

        if(!orderTypeMatched) {
            this.serverApi.getSearch(pageNumber, query, options, callback);
        }
    }

    redirectToOrder(orderNumber, apiMethod, state) {
        let self = this;

        this.serverApi[apiMethod](1, orderNumber, {}, res => {
            for (let orderIndex = 0; orderIndex < res.data.length; orderIndex++) {
                if (res.data[orderIndex].number === orderNumber) {
                    return self.$state.go(state, {id: res.data[orderIndex].id});
                }
            }
        });
    }

    viewProduct (id) {
        this.$state.go('app.product', {id: id});
    }

    /**
     * Navigate inside the table via arrows.
     * Handler of keydown event.
     * If Enter pressed, then open product view
     * @param event
     */
    navigateInTable (event) {
        const ARROW_UP = 38;
        const ENTER = 13;
        const ESCAPE = 27;
        const ARROW_DOWN = 40;

        var key = event.keyCode,
            list = this.data.searchResults,
            _window = angular.element(window),
            scrollTop = _window.scrollTop(),
            outerHeight = _window.outerHeight() + scrollTop;

        if (([ARROW_UP, ARROW_DOWN].indexOf(key) !== -1) && (list.length > 0)) {
            // Blur away from search input if focused
            if(event.target.id === "search-fld" && event.target.tagName === "INPUT") document.activeElement.blur();
            //select row first time
            if (this.selectedRowIndex < 0) {
                this.selectedRowIndex = 0;
            } else {
                var step = key === ARROW_UP ? -1 : 1,
                    newIndex = this.selectedRowIndex + step;

                if((newIndex > -1) && (newIndex < this.data.searchResults.length)) {
                    this.selectedRowIndex = newIndex;

                    const SELECTED_INDEX_POSITION = angular.element('#top_search_table_body>tr')
                        .eq(this.selectedRowIndex).offset();

                    if (SELECTED_INDEX_POSITION.top > outerHeight) {
                        _window.scrollTop(_window.scrollTop() + 200, 1000);
                    }

                    if (SELECTED_INDEX_POSITION.top < scrollTop) {
                        _window.scrollTop(_window.scrollTop() - 200, 1000);
                    }
                }
            }

            //on hit Enter
        } else if ((key === ENTER) && (list.length > 0) && (this.selectedRowIndex > -1)) {

            let selectedRow = list[this.selectedRowIndex];
            this.viewProduct(selectedRow._id || selectedRow.id);

            // on Escape blur input
        } else if ((key === ESCAPE) && (event.target.localName === 'input')) {
            event.target.blur();
        }
    }
}

TopSearchCtrl.$inject = ['$stateParams', '$state', 'serverApi', '$uibModal', 'funcFactory'];

angular.module('app.search').component('topSearch', {
    controller: TopSearchCtrl,
    controllerAs: '$ctrl',
    templateUrl: '/app/search/components/top-search/top-search.html'
});
