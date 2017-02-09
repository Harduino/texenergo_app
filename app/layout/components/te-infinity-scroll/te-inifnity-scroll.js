/**
 * Created by Egor Lobanov on 01.03.16.
 */
(function(){
    "use strict";

    angular.module('te.infinity.scroll', []).component('teInfinityScroll', {
        bindings: {config: '<', loadData: '=', listId: '@', selector: '@', view: '@'},
        controller: function($q, Observer, $element) {
            var self = this;
            this.START_PAGE = 1;

            this.containerElement = $(this.selector);
            this.containerHeight = this.containerElement.outerHeight();

            var DEFAULT_CONFIG = {searchPatternMinimalLength: 0, scrollDistance: 30, loadAfterInit: true};
            this.config = angular.extend(DEFAULT_CONFIG, this.config);

            this.inLoad = false;
            this.resultCollection = [];
            this.containerElement.scroll(handleScroll);
            this.config.loadAfterInit && setQuery('');

            Observer.subscribe('FILTER_LIST', filterData => {
                if(self.listId === filterData.listId) {
                    setQuery(filterData.filter);
                }
            });

            this.$onDestroy = function() {
                self.containerElement.off('scroll');
            };

            function setQuery (query) {
                if(query !== undefined) {
                    self.inLoad && self.abortSearch.resolve();
                    self.currentPage = self.START_PAGE;
                    self.inLoad = false;
                    self.searchQuery = query;
                    self.resultCollection = [];

                    if(query.length >= self.config.searchPatternMinimalLength) {
                        appendNewItems();
                    } else {
                        self.searchStatus = 'before';
                    }
                }
            }

            function handleScroll () {
                if(self.listContentElement === undefined) {
                    self.listContentElement = $($element.find('.te-infinity-scroll-content')[0].firstChild);
                }

                var distance = self.listContentElement.outerHeight() - self.containerElement.scrollTop() - self.containerHeight;

                if(!self.inLoad && (distance < self.config.scrollDistance) && (distance > -self.containerHeight / 2)) {
                    self.currentPage++;
                    appendNewItems(self.config.hideLoadingStatus);
                }
            }

            function appendNewItems (hideLoadingStatus) {
                self.inLoad = true;
                self.searchStatus = hideLoadingStatus ? 'result' : 'inload';
                self.abortSearch = $q.defer();

                self.loadData(self.currentPage, self.searchQuery, {timeout: self.abortSearch.promise}, function (res) {
                    if(res.status == 200) {
                        self.inLoad = res.data.length == 0;

                        res.data.hasOwnProperty('length') && res.data.map(function(item) {
                            self.resultCollection.push(item);
                        });

                        self.searchStatus = (self.currentPage == self.START_PAGE) && self.inLoad ? 'noresult' : 'result';
                    } else {
                        self.inLoad = false;
                        self.searchStatus = 'noresult';
                    }
                });
            }
        },
        controllerAs: '$ctrl',
        templateUrl: 'app/layout/components/te-infinity-scroll/te-infinity-scroll.html'
    });
}());
