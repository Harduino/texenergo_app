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
        controller: function($element, $q, $timeout) {
            var DEFAULT_CONFIG = {
                startFrom: 2,
                startPage: 1,
                scrollDistance: 30,
                maxHeight: 200,
                delay: 500,
                notShowLoadStatus: false,
                dataMethod: angular.noop
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

            this.setSearchStatus = function(searchStatus) {
                ['before', 'noresult', 'inload'].forEach(function(status) {
                    document.getElementById('UiSelectInfinitySearchStatus-' + status).style.display =
                        status === searchStatus ? 'block' : 'none';
                });
            };

            this.config = angular.extend(DEFAULT_CONFIG, this.config);

            $timeout(function() {
                $element.find('.ui-select-choices').append('<div class="ui-select-status">' +
                    '<span id="UiSelectInfinitySearchStatus-before">Введите еще хотя бы ' + self.config.startFrom + ' символа</span>'+
                    '<span id="UiSelectInfinitySearchStatus-noresult">Поиск не дал результатов</span>'+
                    '<span id="UiSelectInfinitySearchStatus-inload">Поиск...</span>'+
                '</div>');

                self.setSearchStatus('before');
                searchBox = $element.find('.ui-select-search')[0];

                searchBox.addEventListener('input', function(e) {
                    triggerSearch(e.target.value);
                });
            }, 500);

            var triggerSearch = function(value) {
                inLoad && canceler.resolve();
                $timeout.cancel(timeout_p);
                page = self.config.startPage;
                inLoad = false;
                query = value;
                self.items = [];

                if (value !== '' && value.length >= self.config.startFrom) {
                    timeout_p = $timeout(load, self.config.delay);
                } else {
                    self.setSearchStatus('before');
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
                if(!inLoad && ((list.outerHeight() - content.scrollTop() - self.config.maxHeight) < self.config.scrollDistance)) {
                    page++;
                    load(self.config.notShowLoadStatus);
                }
            }

            function load (hideStatus){
                inLoad = true;
                self.setSearchStatus(hideStatus ? 'result' : 'inload');
                canceler = $q.defer();

                self.config.dataMethod(page, query, {timeout:canceler.promise}, function(result) {
                    inLoad = result.data.length == 0;
                    self.items = self.items.concat(result.data);
                    self.setSearchStatus((page == self.config.startPage) && (result.data.length == 0) ? 'noresult' : 'result');
                });
            }

            this.$onDestroy = function() {
                content && content.off('scroll');
            };
        }
    });
}());
