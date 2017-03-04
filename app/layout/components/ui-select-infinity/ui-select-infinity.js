/**
 * Created by Egor Lobanov on 26.11.15.
 * append directive to ui-select with 'select2' theme to provide lazy loading of searched data
 * include your config via `config` attribute
 * dataMethod should match following format: function(page, query, configuration, success)
 */
(function(){
    angular.module('app.layout').component('uiSelectInfinity', {
        bindings: {config: '<', onSelect: '&', view: '@', ngModel: '='},
        templateUrl: 'app/layout/components/ui-select-infinity/ui-select-infinity.html',
        controllerAs: '$ctrl',
        controller: function($scope, $element, $q, $compile, $timeout) {
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

            var self = this, searchBox;

            var page,                   // current page for load
                content,                // ui-select-choices-content
                list,                   // list of items
                inLoad,                 // loading status
                query,                  // search query
                canceler,               // request canceler
                timeout_p,              // $timeout promise
                defer = $q.defer();     // defer to append scroll listener

            config = $scope.config = angular.extend(config, this.config);
            $scope.searchStatus = 'before';

            $timeout(function() {
                $element.find('.ui-select-choices').append($compile(config.searchStatusTmpl)($scope));
                searchBox = $element.find('.ui-select-search')[0];

                searchBox.addEventListener('input', function(e) {
                    triggerSearch(e.target.value);
                });
            }, 500);

            var triggerSearch = function(value) {
                inLoad && canceler.resolve();
                $timeout.cancel(timeout_p);
                page = config.startPage;
                inLoad = false;
                query = value;
                self.items = [];

                if (value !== '' && value.length >= config.startFrom) {
                    timeout_p = $timeout(load, config.delay);
                } else {
                    $scope.searchStatus = 'before';
                }
            };

            defer.promise.then(function() {
                content = $element.find('.ui-select-choices-content').scroll(scroll);
                list = content.find('.ui-select-choices-group');
            });

            self.focusSearchBox = function() {
                defer.resolve();
                $timeout(function(){
                    searchBox.focus()
                }, 100);
            };

            function scroll(){
                if(!inLoad && ((list.outerHeight() - content.scrollTop() - config.maxHeight) < config.scrollDistance)) {
                    page++;
                    load(config.notShowLoadStatus);
                }
            }

            function load (hideStatus){
                inLoad = true;
                $scope.searchStatus = hideStatus ? 'result' : 'inload';
                canceler = $q.defer();

                config.dataMethod(page, query, {timeout:canceler.promise}, function(result) {
                    inLoad = result.data.length == 0;
                    self.items = self.items.concat(result.data);
                    $scope.searchStatus = (page == config.startPage) && (result.data.length == 0) ? 'noresult' : 'result';
                });
            }

            $scope.$on('$destroy', function(){
                content && content.off('scroll');
            });
        }
    });
}());
