/**
 * Created by Egor Lobanov on 01.03.16.
 */
(function(){
    "use strict";

    angular.module('te.infinity.scroll', []).directive('teInfinity', ['$q', '$timeout', '$compile', function($q, $timeout, $compile){

        return {
            restrict: "A",
            scope: {
                config: '=teInfinity'
            },
            link: function(scope, element){

                var config = {
                    startFrom:0,
                    startPage:1,
                    scrollDistance:30,
                    delay: 500,
                    dataMethod: angular.noop,
                    liveLoad: false,
                    loadAfterInit: true,
                    resultCollection: [],
                    searchStatusTmpl: '<div class="ui-select-status">' +
                        '<span ng-if="searchStatus == \'before\'">Введите еще хотя бы {{config.startFrom}} символа</span>'+
                        '<span ng-if="searchStatus == \'noresult\'">Нет результатов</span>'+
                        '<span ng-if="searchStatus == \'inload\'">Загрузка...</span>'+
                        '</div>'
                };

                var page,                                       // current page for load
                    content = $(element[0].firstElementChild),  // content of scroll
                    inLoad = false,                             // loading status
                    query,                                      // search query
                    canceler,                                   // request canceler
                    timeout_p,                                  // $timeout promise
                    elHeight = element.outerHeight();

                config = angular.extend(config, scope.config);

                element.append($compile(config.searchStatusTmpl)(scope));

                element.scroll(scroll);

                config.liveLoad ? scope.$watch('config.queryModel', function(value){
                    setQueryValue(value);
                }) : scope.config.setQueryValue = setQueryValue;

                config.loadAfterInit && setQueryValue("");

                function setQueryValue (value){
                    if(value !== undefined){
                        inLoad && canceler.resolve();
                        $timeout.cancel(timeout_p);
                        page = config.startPage;
                        inLoad = false;
                        query = value;
                        scope.config.resultCollection = [];
                        if(value.length>=config.startFrom) timeout_p = $timeout(load, config.delay);
                        else scope.searchStatus='before';
                    }
                }

                function scroll(){
                    var p = content.outerHeight() - element.scrollTop() - elHeight;
                    if(!inLoad && p<config.scrollDistance && p>-elHeight/2){
                        page++;
                        load(config.notShowLoadStatus);
                    }
                }

                function load (notShowStatus){
                    inLoad = true;
                    scope.searchStatus= notShowStatus ? 'result' : 'inload';
                    canceler = $q.defer();
                    config.dataMethod(page, query, {timeout:canceler.promise}, function(result){
                        if(result.status == 200){
                            inLoad = result.data.length==0;
                            //scope.resultCollection =  scope.$select.items.concat(result.data);
                            result.data.hasOwnProperty('length') && result.data.map(function(item){
                                scope.config.resultCollection.push(item);
                            });
                            if(page == config.startPage && inLoad) scope.searchStatus='noresult';
                            else scope.searchStatus='result';
                        }else {
                            inLoad = false;
                            scope.searchStatus='noresult';
                        }
                    });
                }

                scope.$on('$destroy', function(){
                    element.off('scroll');
                });
            }
        }
    }]);
}());