class InfinityScrollCtrl {
    constructor($q, Observer, $element) {
        let self = this;
        this.$q = $q;
        this.$element = $element;

        this.START_PAGE = 1;
        this.containerElement = $(this.selector);
        this.containerHeight = this.containerElement.outerHeight();

        const DEFAULT_CONFIG = {searchPatternMinimalLength: 0, scrollDistance: 30, loadAfterInit: true};
        this.config = angular.extend(DEFAULT_CONFIG, this.config);

        this.inLoad = false;
        this.resultCollection = [];
        this.containerElement.scroll(this.handleScroll.bind(this));
        this.config.loadAfterInit && self.setQuery('');

        Observer.subscribe('FILTER_LIST', filterData => {
            if(self.listId === filterData.listId) {
                self.setQuery(filterData.filter);
            }
        });

        this.$onDestroy = () => self.containerElement.off('scroll');
    }

    setQuery (query) {
        if(query !== undefined) {
            this.inLoad && this.abortSearch.resolve();
            this.currentPage = this.START_PAGE;
            this.inLoad = false;
            this.searchQuery = query;
            this.resultCollection = [];

            if(query.length >= this.config.searchPatternMinimalLength) {
                this.loadNewItems();
            } else {
                this.searchStatus = 'before';
            }
        }
    }

    handleScroll () {
        if(this.listContentElement === undefined) {
            this.listContentElement = $(this.$element.find('.te-infinity-scroll-content')[0].firstChild);
        }

        const distance = this.listContentElement.outerHeight() - this.containerElement.scrollTop() - this.containerHeight;

        if(!this.inLoad && (distance < this.config.scrollDistance) && (distance > -this.containerHeight / 2)) {
            this.currentPage++;
            this.loadNewItems(this.config.hideLoadingStatus);
        }
    }

    loadNewItems (hideLoadingStatus) {
        this.inLoad = true;
        this.searchStatus = hideLoadingStatus ? 'result' : 'inload';
        this.abortSearch = this.$q.defer();
        let self = this;

        this.loadData(this.currentPage, this.searchQuery, {timeout: self.abortSearch.promise}, res => {
            if(res.status == 200) {
                self.inLoad = res.data.length == 0;
                res.data.hasOwnProperty('length') && res.data.map(item => self.resultCollection.push(item));
                self.searchStatus = (self.currentPage == self.START_PAGE) && self.inLoad ? 'noresult' : 'result';
            } else {
                self.inLoad = false;
                self.searchStatus = 'noresult';
            }
        });
    }
}

InfinityScrollCtrl.$inject = ['$q', 'Observer', '$element'];

angular.module('te.infinity.scroll', []).component('teInfinityScroll', {
    bindings: {config: '<', loadData: '=', listId: '@', selector: '@', view: '@'},
    controller: InfinityScrollCtrl,
    controllerAs: '$ctrl',
    templateUrl: 'app/layout/components/te-infinity-scroll/te-infinity-scroll.html'
});
