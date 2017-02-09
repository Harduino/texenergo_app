/**
 * Created by Egor Lobanov on 01.03.16.
 */
(function(){
    "use strict";

    angular.module('te.infinity.scroll', []).component('teInfinityScroll', {
        bindings: {config: '<', loadData: '=', listId: '@', selector: '@', view: '@'},
        controller: function($q, Observer, $element) {
            var self = this;
            var START_PAGE = 1;
            var DEFAULT_CONFIG = {searchPatternMinimalLength: 0, scrollDistance: 30, loadAfterInit: true};
            var containerElement = $(this.selector);

            var currentPage,
                listContentElement,
                inLoad = false,
                searchQuery,
                abortSearch,
                containerHeight = containerElement.outerHeight();

            this.config = angular.extend(DEFAULT_CONFIG, this.config);
            this.resultCollection = [];
            containerElement.scroll(handleScroll);
            this.config.loadAfterInit && setQuery('');

            Observer.subscribe('FILTER_LIST', filterData => {
                if(self.listId === filterData.listId) {
                    setQuery(filterData.filter);
                }
            });

            function setQuery (query) {
                if(query !== undefined) {
                    inLoad && abortSearch.resolve();
                    currentPage = START_PAGE;
                    inLoad = false;
                    searchQuery = query;
                    self.resultCollection = [];

                    if(query.length >= self.config.searchPatternMinimalLength) {
                        appendNewItems();
                    } else {
                        self.searchStatus = 'before';
                    }
                }
            }

            function handleScroll () {
                if(listContentElement === undefined) {
                    listContentElement = $($element.find('.te-infinity-scroll-content')[0].firstChild);
                }

                var p = listContentElement.outerHeight() - containerElement.scrollTop() - containerHeight;

                if(!inLoad && (p < self.config.scrollDistance) && (p > -containerHeight / 2)) {
                    currentPage++;
                    appendNewItems(self.config.hideLoadingStatus);
                }
            }

            function appendNewItems (hideLoadingStatus) {
                inLoad = true;
                self.searchStatus = hideLoadingStatus ? 'result' : 'inload';
                abortSearch = $q.defer();

                self.loadData(currentPage, searchQuery, {timeout: abortSearch.promise}, function(result) {
                    if(result.status == 200) {
                        inLoad = result.data.length == 0;

                        result.data.hasOwnProperty('length') && result.data.map(function(item) {
                            self.resultCollection.push(item);
                        });

                        self.searchStatus = (currentPage == START_PAGE) && inLoad ? 'noresult' : 'result';
                    } else {
                        inLoad = false;
                        self.searchStatus = 'noresult';
                    }
                });
            }

            this.$onDestroy = function() {
                containerElement.off('scroll');
            };
        },
        controllerAs: '$ctrl',
        templateUrl: 'app/layout/components/te-infinity-scroll/te-infinity-scroll.html'
    });
}());
