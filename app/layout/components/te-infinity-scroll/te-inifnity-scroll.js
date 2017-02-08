/**
 * Created by Egor Lobanov on 01.03.16.
 */
(function(){
    "use strict";

    angular.module('te.infinity.scroll', []).component('teInfinityScroll', {
        bindings: {config: '<', loadData: '=', listId: '@', selector: '@', view: '@'},
        controller: function($q, Observer, $scope, $element) {
            var self = this;
            var START_PAGE = 1;
            var DEFAULT_CONFIG = {startFrom: 0, scrollDistance: 30, loadAfterInit: true};
            var block = $(this.selector);

            var page,                                       // current page for load
                content,                                    // content of scroll
                inLoad = false,                             // loading status
                query,                                      // search query
                canceler,                                   // request canceler
                elHeight = block.outerHeight();

            this.config = angular.extend(DEFAULT_CONFIG, this.config);
            this.resultCollection = [];
            block.scroll(scroll);
            this.config.loadAfterInit && setQueryValue('');

            Observer.subscribe('FILTER_LIST', filterData => {
                if(self.listId === filterData.listId) {
                    setQueryValue(filterData.filter);
                }
            });

            function setQueryValue (value) {
                if(value !== undefined) {
                    inLoad && canceler.resolve();
                    page = START_PAGE;
                    inLoad = false;
                    query = value;
                    self.resultCollection = [];

                    if(value.length >= self.config.startFrom) {
                        load();
                    } else {
                        $scope.searchStatus = 'before';
                    }
                }
            }

            function scroll() {
                if(content === undefined) {
                    content = $($element.find('.te-infinity-scroll-content')[0].firstChild);
                }

                var p = content.outerHeight() - block.scrollTop() - elHeight;

                if(!inLoad && (p < self.config.scrollDistance) && (p > -elHeight / 2)) {
                    page++;
                    load(self.config.hideLoadingStatus);
                }
            }

            function load (hideLoadingStatus) {
                inLoad = true;
                $scope.searchStatus = hideLoadingStatus ? 'result' : 'inload';
                canceler = $q.defer();

                self.loadData(page, query, {timeout: canceler.promise}, function(result) {
                    if(result.status == 200) {
                        inLoad = result.data.length == 0;

                        result.data.hasOwnProperty('length') && result.data.map(function(item) {
                            self.resultCollection.push(item);
                        });

                        $scope.searchStatus = (page == START_PAGE) && inLoad ? 'noresult' : 'result';
                    } else {
                        inLoad = false;
                        $scope.searchStatus = 'noresult';
                    }
                });
            }

            $scope.$on('$destroy', function() {
                block.off('scroll');
            });
        },
        controllerAs: '$ctrl',
        templateUrl: 'app/layout/components/te-infinity-scroll/te-infinity-scroll.html'
    });
}());
