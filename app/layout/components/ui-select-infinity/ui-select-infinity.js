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

            var self = this;
            this.defer = $q.defer();
            this.config = angular.extend(DEFAULT_CONFIG, this.config);

            $timeout(function() {
                $element.find('.ui-select-choices').append('<div class="ui-select-status">' +
                    '<span id="UiSelectInfinitySearchStatus-before">Введите еще хотя бы ' + self.config.startFrom + ' символа</span>'+
                    '<span id="UiSelectInfinitySearchStatus-noresult">Поиск не дал результатов</span>'+
                    '<span id="UiSelectInfinitySearchStatus-inload">Поиск...</span>'+
                '</div>');

                self.setSearchStatus('before');
                self.searchBox = $element.find('.ui-select-search')[0];

                self.searchBox.addEventListener('input', function(e) {
                    triggerSearch(e.target.value);
                });
            }, 500);

            this.defer.promise.then(function() {
                self.content = $element.find('.ui-select-choices-content').scroll(scroll);
                self.list = self.content.find('.ui-select-choices-group');
            });

            this.$onDestroy = function() {
                self.content && self.content.off('scroll');
                self.searchBox && self.searchBox.off('input');
            };

            var triggerSearch = function(value) {
                self.inLoad && self.canceler.resolve();
                $timeout.cancel(self.timerId);
                self.page = self.config.startPage;
                self.inLoad = false;
                self.query = value;
                self.items = [];

                if (value !== '' && value.length >= self.config.startFrom) {
                    self.timerId = $timeout(load, self.config.delay);
                } else {
                    self.setSearchStatus('before');
                }
            };

            this.setSearchStatus = function(searchStatus) {
                ['before', 'noresult', 'inload'].forEach(function(status) {
                    document.getElementById('UiSelectInfinitySearchStatus-' + status).style.display =
                        status === searchStatus ? 'block' : 'none';
                });
            };

            self.focusSearchBox = function() {
                self.defer.resolve();
                $timeout(function(){
                    self.searchBox.focus();
                }, 100);
            };

            function scroll(){
                if(!self.inLoad && ((self.list.outerHeight() - self.content.scrollTop() - self.config.maxHeight) < self.config.scrollDistance)) {
                    self.page++;
                    load(self.config.notShowLoadStatus);
                }
            }

            function load (hideStatus){
                self.inLoad = true;
                self.setSearchStatus(hideStatus ? 'result' : 'inload');
                self.canceler = $q.defer();

                self.config.dataMethod(self.page, self.query, {timeout: self.canceler.promise}, function(res) {
                    self.inLoad = res.data.length == 0;
                    self.items = self.items.concat(res.data);
                    self.setSearchStatus((self.page == self.config.startPage) && (res.data.length == 0) ? 'noresult' : 'result');
                });
            }
        }
    });
}());
