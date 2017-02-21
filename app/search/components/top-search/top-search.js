class TopSearchCtrl {
    constructor($stateParams, $state, serverApi, $uibModal) {
        let self = this;
        this.serverApi = serverApi;
        this.$state = $state;

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
                {type: 'view', callback: self.viewProduct.bind(self)}
            ]
        };

        let tableNavigationHandler = self.navigateInTable.bind(self);
        angular.element(window).on('keydown', tableNavigationHandler);
        this.$onDestroy = () => angular.element(window).off('keydown', tableNavigationHandler);
    }

    // We are looking for popular document numbering pattern. If one is matched, then navigate there.
    // i.e. consider it a command instead of a search request.
    getSearchProductHandler () {
        let serverApi = this.serverApi;
        let n;
        switch(true){
            case /р-\d{2}-[а-я]{2,4}-\d+/i.test(this.data.searchText):
                n = this.data.searchText.match(/р-\d{2}-[а-я]{2,4}-\d+/i)[0];
                serverApi.getDispatchOrders(1, n, {}, r => {
                    for (var i = 0; i < r.data.length; i++) {
                        var order = r.data[i];
                        if (order.number === n) {
                            return this.$state.go('app.dispatch_orders.view', {id: order.id});
                        }

                    }
                });
                break;
            case /\d{2}-[а-я]{2,4}-\d+/i.test(this.data.searchText):
                n = this.data.searchText.match(/\d{2}-[а-я]{2,4}-\d+/i)[0];
                serverApi.getCustomerOrders(1, n, {}, r => {
                    for (var i = 0; i < r.data.length; i++) {
                        var order = r.data[i];
                        if (order.number === n) {
                            return this.$state.go('app.customer_orders.view', {id: order.id});
                        }
                    }
                });
                break;
            default:
                return (pageNumber, query, options, callback) => serverApi.getSearch(pageNumber, query, options, callback);
                break;
        }        
    }

    selectRow (index) {
        this.selectedRowIndex = index;
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

TopSearchCtrl.$inject = ['$stateParams', '$state', 'serverApi', '$uibModal'];

angular.module('app.search').component('topSearch', {
    controller: TopSearchCtrl,
    controllerAs: '$ctrl',
    templateUrl: '/app/search/components/top-search/top-search.html'
});
