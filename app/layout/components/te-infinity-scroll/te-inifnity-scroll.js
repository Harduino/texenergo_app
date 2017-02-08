/**
 * Created by Egor Lobanov on 01.03.16.
 */
(function(){
    "use strict";

    angular.module('te.infinity.scroll', []).component('teInfinityScroll', {
        bindings: {config: '=', listId: '@', selector: '@', view: '@'},
        controller: function($q, Observer, $scope, $element) {
            var config = {
                startFrom: 0,
                startPage: 1,
                scrollDistance: 30,
                loadAfterInit: true
            };

            var block = $(this.selector);
            var self = this;
            $scope.resultCollection = [];

            var page,                                       // current page for load
                content,                                    // content of scroll
                inLoad = false,                             // loading status
                query,                                      // search query
                canceler,                                   // request canceler
                elHeight = block.outerHeight();

            config = angular.extend(config, this.config);
            this.startFrom = config.startFrom;
            block.scroll(scroll);

            config.loadAfterInit && setQueryValue('');

            Observer.subscribe('FILTER_LIST', filterData => {
                if(self.listId === filterData.listId) {
                    setQueryValue(filterData.filter);
                }
            });

            function setQueryValue (value) {
                if(value !== undefined) {
                    inLoad && canceler.resolve();
                    page = config.startPage;
                    inLoad = false;
                    query = value;
                    $scope.resultCollection = [];

                    if(value.length >= config.startFrom) {
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

                if(!inLoad && (p < config.scrollDistance) && (p > -elHeight / 2)) {
                    page++;
                    load(config.notShowLoadStatus);
                }
            }

            function load (notShowStatus){
                inLoad = true;
                $scope.searchStatus = notShowStatus ? 'result' : 'inload';
                canceler = $q.defer();

                config.dataMethod(page, query, {timeout: canceler.promise}, function(result) {
                    if(result.status == 200) {
                        inLoad = result.data.length == 0;

                        result.data.hasOwnProperty('length') && result.data.map(function(item) {
                            $scope.resultCollection.push(item);
                        });

                        $scope.searchStatus = (page == config.startPage) && inLoad ? 'noresult' : 'result';
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
