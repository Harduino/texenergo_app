class LazyLoadedListCtrl {
    constructor (serverApi) {
        this.startPage = (this.startPage === undefined) || (this.startPage === null) ? 1 : parseInt(this.startPage);
        this.pageNumber = this.startPage;

        this.disabled = false;
        this.notFound = false;
        this.showLoader = false;

        if(this.apiMethod !== undefined) {
            this.fetch = serverApi[this.apiMethod];
        }

        this.loadItems = this.loadItems.bind(this);
        this.loadItems();
    }

    loadItems () {
        if(this.disabled || !this.fetch) {
            return;
        }

        this.disabled = true;
        this.showLoader = true;
        let self = this;

        this.fetch(this.pageNumber, this.searchQuery, {}, res => {
            self.showLoader = false;
            self.disabled = res.data.length === 0;

            if(self.disabled) {
                self.notFound = self.pageNumber === self.startPage;
            } else {
                self.items = self.items.concat(res.data);
                self.pageNumber++;
            }
        });
    }
}

LazyLoadedListCtrl.$inject = ['serverApi'];

angular.module('app.layout').component('lazyLoadedList', {
    bindings: {apiMethod: '@', fetch: '=', items: '=', navOptions: '=', role: '=', searchQuery: '=', startPage: '@', view: '@'},
    templateUrl: 'app/layout/components/lazy-loaded-list/lazy-loaded-list.html',
    controller: LazyLoadedListCtrl,
    controllerAs: '$ctrl'
});
