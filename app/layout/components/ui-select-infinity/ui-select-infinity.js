class UiSelectInfinityCtrl {
    constructor($element, $q, $timeout) {
        let DEFAULT_CONFIG = {
            startFrom: 2,
            startPage: 1,
            scrollDistance: 30,
            maxHeight: 200,
            delay: 500,
            notShowLoadStatus: false,
            dataMethod: angular.noop
        };

        let self = this;
        this.$q = $q;
        this.$timeout = $timeout;
        this.$element = $element;

        this.defer = $q.defer();
        this.config = angular.extend(DEFAULT_CONFIG, this.config);
        let triggerSearch = e => self.triggerSearch(e.target.value);

        $timeout(() => {
            $element.find('.ui-select-choices').append('<div class="ui-select-status">' +
                '<span id="UiSelectInfinitySearchStatus-before">Введите еще хотя бы ' + self.config.startFrom + ' символа</span>'+
                '<span id="UiSelectInfinitySearchStatus-noresult">Поиск не дал результатов</span>'+
                '<span id="UiSelectInfinitySearchStatus-inload">Поиск...</span>'+
            '</div>');

            UiSelectInfinityCtrl.setSearchStatus('before');
            self.searchBox = $element.find('.ui-select-search')[0];
            self.searchBox.addEventListener('input', triggerSearch);
        }, 500);

        this.defer.promise.then(() => {
            self.content = $element.find('.ui-select-choices-content').scroll(self.scroll.bind(self));
            self.list = self.content.find('.ui-select-choices-group');
        });

        this.$onDestroy = () => {
            self.content && self.content.off('scroll');
            self.searchBox && self.searchBox.removeEventListener('input', triggerSearch);
        };
    }

    triggerSearch(query) {
        this.inLoad && this.canceler.resolve();
        this.$timeout.cancel(this.timerId);
        this.page = this.config.startPage;
        this.inLoad = false;
        this.query = query;
        this.items = [];

        if (query !== '' && query.length >= this.config.startFrom) {
            this.timerId = this.$timeout(this.load.bind(this), this.config.delay);
        } else {
            UiSelectInfinityCtrl.setSearchStatus('before');
        }
    }

    focusSearchBox () {
        let self = this;
        this.defer.resolve();
        this.$timeout(() => self.searchBox.focus(), 100);
    }

    scroll () {
        if(!this.inLoad && (this.getRemainingScrollDistance() < this.config.scrollDistance)) {
            this.page++;
            this.load(this.config.notShowLoadStatus);
        }
    }

    getRemainingScrollDistance () {
        return this.list.outerHeight() - this.content.scrollTop() - this.config.maxHeight;
    }

    load (hideStatus) {
        this.inLoad = true;
        UiSelectInfinityCtrl.setSearchStatus(hideStatus ? 'result' : 'inload');
        this.canceler = this.$q.defer();

        let self = this;

        this.config.dataMethod(this.page, this.query, {timeout: self.canceler.promise}, res => {
            self.inLoad = res.data.length == 0;
            self.items = self.items.concat(res.data);

            let $select2 = self.$element.find('.select2.select2-container'),
                $uiSelectController = $select2.data().$uiSelectController;

            // if for some reasons $uiSelectController don't know about changes
            if($uiSelectController && !$uiSelectController.items.length && self.items.length>0){
              for(var i=0, items= self.items, il= items.length; i<il; i++){
                // update items manually
                $uiSelectController.items.push(items[i]);
              }
            }
            UiSelectInfinityCtrl.setSearchStatus((self.page == self.config.startPage) && (res.data.length == 0) ? 'noresult' : 'result');
        });
    }

    static setSearchStatus (searchStatus) {
        ['before', 'noresult', 'inload'].forEach(status => {
            document.getElementById('UiSelectInfinitySearchStatus-' + status).style.display =
                status === searchStatus ? 'block' : 'none';
        });
    };
}

UiSelectInfinityCtrl.$inject =['$element', '$q', '$timeout'];

angular.module('app.layout').component('uiSelectInfinity', {
    bindings: {config: '<', onSelect: '&', view: '@', ngModel: '='},
    templateUrl: 'app/layout/components/ui-select-infinity/ui-select-infinity.html',
    controllerAs: '$ctrl',
    controller: UiSelectInfinityCtrl
});
