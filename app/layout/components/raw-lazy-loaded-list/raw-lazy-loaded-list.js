class RawLazyLoadedListCtrl {
    constructor () {
        this.startPage = (this.startPage === undefined) || (this.startPage === null) ? 1 : parseInt(this.startPage);
        this.pageNumber = this.startPage;

        this.disabled = false;
        this.notFound = false;
        this.showLoader = false;

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

angular.module('app.layout').component('rawLazyLoadedList', {
    bindings: {fetch: '=', items: '=', navOptions: '=', role: '=', searchQuery: '=', startPage: '<', view: '@'},
    templateUrl: 'app/layout/components/raw-lazy-loaded-list/raw-lazy-loaded-list.html',
    controller: RawLazyLoadedListCtrl,
    controllerAs: '$ctrl'
});
