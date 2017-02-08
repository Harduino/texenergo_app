/**
 * Created by Egor Lobanov on 01.03.16.
 */
(function(){
    "use strict";

    angular.module('te.infinity.scroll', []).directive('teInfinityScroll', ['$q', '$timeout', function($q, $timeout) {
        return {
            restrict: 'E',
            scope: {config: '=', selector: '@', view: '@'},
            link: function($scope, $element) {
                var config = {
                    startFrom: 0,
                    startPage: 1,
                    scrollDistance: 30,
                    delay: 500,
                    dataMethod: angular.noop,
                    liveLoad: false,
                    loadAfterInit: true
                };

                var block = $($scope.selector);
                $scope.resultCollection = [];

                var page,                                       // current page for load
                    content,                                    // content of scroll
                    inLoad = false,                             // loading status
                    query,                                      // search query
                    canceler,                                   // request canceler
                    timeout_p,                                  // $timeout promise
                    elHeight = block.outerHeight();

                config = angular.extend(config, $scope.config);
                block.scroll(scroll);

                config.liveLoad ? $scope.$watch('config.queryModel', function(value){
                    setQueryValue(value);
                }) : $scope.config.setQueryValue = setQueryValue;

                config.loadAfterInit && setQueryValue("");

                function setQueryValue (value){
                    if(value !== undefined){
                        inLoad && canceler.resolve();
                        $timeout.cancel(timeout_p);
                        page = config.startPage;
                        inLoad = false;
                        query = value;
                        $scope.resultCollection = [];

                        if(value.length >= config.startFrom) {
                            timeout_p = $timeout(load, config.delay);
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

                    if(!inLoad && p < config.scrollDistance && p > -elHeight / 2) {
                        page++;
                        load(config.notShowLoadStatus);
                    }
                }

                function load (notShowStatus){
                    inLoad = true;
                    $scope.searchStatus= notShowStatus ? 'result' : 'inload';
                    canceler = $q.defer();
                    config.dataMethod(page, query, {timeout:canceler.promise}, function(result){
                        if(result.status == 200){
                            inLoad = result.data.length == 0;

                            result.data.hasOwnProperty('length') && result.data.map(function(item){
                                $scope.resultCollection.push(item);
                            });

                            $scope.searchStatus = (page == config.startPage) && inLoad ? 'noresult' : 'result';
                        } else {
                            inLoad = false;
                            $scope.searchStatus='noresult';
                        }
                    });
                }

                $scope.$on('$destroy', function(){
                    block.off('scroll');
                });
            },
            templateUrl: 'app/layout/components/te-infinity-scroll/te-infinity-scroll.html'
        };
    }]);
}());
