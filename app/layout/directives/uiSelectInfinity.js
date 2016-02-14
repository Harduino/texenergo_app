/**
 * Created by Egor Lobanov on 26.11.15.
 * append directive to ui-select with 'select2' theme to provide lazy loading of searched data
 * include your config via ui-select-infinity attribute
 * dataMethod should match following format: function(page, query, configuration, success)
 */
(function(){

    angular.module('app.layout').directive('uiSelectInfinity', ['$q', '$compile', '$timeout', function($q, $compile, $timeout){
        return {
            restrict:'A',
            link:function(scope, element, attrs){
                var config = {
                    startFrom:2,
                    startPage:1,
                    scrollDistance:30,
                    maxHeight: 200,
                    delay: 500,
                    notShowLoadStatus: false,
                    dataMethod: angular.noop,
                    searchStatusTmpl: '<div class="ui-select-status">' +
                        '<span ng-if="searchStatus == \'before\'">Введите еще хотя бы {{config.startFrom}} символа</span>'+
                        '<span ng-if="searchStatus == \'noresult\'">Поиск не дал результатов</span>'+
                        '<span ng-if="searchStatus == \'inload\'">Поиск...</span>'+
                        '</div>'
                };

                var page,                   // current page for load
                    content,                // ui-select-choices-content
                    list,                   // list of items
                    inLoad,                 // loading status
                    query,                  // search query
                    canceler,               // request canceler
                    timeout_p,              // $timeout promise
                    defer = $q.defer();     // defer to append scroll listener

                var unWatchConfig = scope.$watch(attrs.uiSelectInfinity, function(value){
                    if(value) {
                        config = scope.config = angular.extend(config, value);
                        element.find('.ui-select-choices').append($compile(config.searchStatusTmpl)(scope));
                        scope.searchStatus='before';
                        unWatchConfig();
                    }

                });

                scope.$watch('$select.search', function(value){
                    if(value !== undefined){
                        inLoad && canceler.resolve();
                        $timeout.cancel(timeout_p);
                        page = config.startPage;
                        inLoad = false;
                        query = value;
                        scope.$select.items = [];
                        if(value !== '' && value.length>=config.startFrom) timeout_p = $timeout(load, config.delay);
                        else scope.searchStatus='before';
                    }
                });


                defer.promise.then(function(){
                    content = element.find('.ui-select-choices-content').scroll(scroll);
                    list = content.find('.ui-select-choices-group');
                });

                scope.$watch('$select.open', function(value){
                    if(value){
                        defer.resolve();
                        $timeout(function(){scope.$select.searchInput[0].focus()}, 100);
                    }
                });

                function scroll(){
                    if(!inLoad && ((list.outerHeight() - content.scrollTop() - config.maxHeight)<config.scrollDistance)){
                        page++;
                        load(config.notShowLoadStatus);
                    }
                }

                function load (notShowStatus){
                    inLoad = true;
                    scope.searchStatus= notShowStatus ? 'result' : 'inload';
                    canceler = $q.defer();
                    config.dataMethod(page, query, {timeout:canceler.promise}, function(result){
                        inLoad = result.data.length==0;
                        scope.$select.items =  scope.$select.items.concat(result.data);
                        if(page == config.startPage && result.data.length==0) scope.searchStatus='noresult';
                        else scope.searchStatus='result';
                    });
                }

                scope.$on('$destroy', function(){
                    content && content.off('scroll');
                });
            }
        };
    }]);
}());
