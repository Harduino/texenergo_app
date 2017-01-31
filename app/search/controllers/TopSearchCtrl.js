class TopSearchCtrl {
    constructor(sc, $stateParams, $state, serverApi, $uibModal) {
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

        angular.element(window).on('keydown', self.navigateInTable.bind(self));
        sc.$on('$destroy', () => angular.element(window).off('keydown', self.navigateInTable.bind(self)));
    }

    getSearchProductHandler () {
        let serverApi = this.serverApi;
        return (pageNumber, query, options, callback) => serverApi.getSearch(pageNumber, query, options, callback);
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

TopSearchCtrl.$inject = ['$scope', '$stateParams', '$state', 'serverApi', '$uibModal'];
angular.module('app.search').controller('TopSearchCtrl', TopSearchCtrl);
