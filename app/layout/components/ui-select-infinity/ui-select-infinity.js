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
      this.observer;

      this.defer = $q.defer();
      this.config = angular.extend(DEFAULT_CONFIG, this.config);
      let triggerSearch = e => self.triggerSearch(e.target.value);

      this.defer.promise.then(() => {
        self.content = $element.find('.ui-select-choices-content').scroll(self.scroll.bind(self));
        self.list = self.content.find('.ui-select-choices-group');
      });

      this.$onDestroy = () => {
        self.content && self.content.off('scroll');
        self.searchBox && self.searchBox.removeEventListener('input', triggerSearch);
        if(this.observer) this.observer.disconnect();
      };
    }

    $postLink(){
      let self = this;

      this.observer = new MutationObserver((mutations) => {
        for(let mutation of mutations){
          // ждем пока ng-include отрисуется
          if(mutation.type === 'childList'){
            self.observer.disconnect();
            self.initStatuses();
            break;
          }
        }
      });

      this.observer.observe(
        this.$element[0],
        {childList: true}
      );
    }

    initStatuses() {
      let self = this;

      this.$element.find('.ui-select-choices').append('<div class="ui-select-status">' +
        '<span class="UiSelectInfinitySearchStatus-before">Введите еще хотя бы ' + self.config.startFrom + ' символа</span>'+
        '<span class="UiSelectInfinitySearchStatus-noresult">Поиск не дал результатов</span>'+
        '<span class="UiSelectInfinitySearchStatus-inload">Поиск...</span>'+
      '</div>');

      this.setSearchStatus('before');
      this.searchBox = this.$element.find('.ui-select-search')[0];
      this.searchBox.addEventListener('input', (e) => {
        self.triggerSearch(e.target.value);
      });
    }

    triggerSearch(query) {
      this.inLoad && this.canceler.resolve();
      this.$timeout.cancel(this.timerId);
      this.page = this.config.startPage;
      this.inLoad = false;
      this.query = query;

      if (query !== '' && query.length >= this.config.startFrom) {
        this.timerId = this.$timeout(this.load.bind(this), this.config.delay);
      } else {
        let controller = this.getUiSelectController();

        // timeout to trigger digest cycle
        controller && this.$timeout(() => {
          controller.items = [];
        }, 0);

        this.setSearchStatus('before');
      }
    }

    focusSearchBox () {
      let self = this;
      this.defer.resolve();
      this.$timeout(() =>  self.searchBox && self.searchBox.focus(), 100);
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
      this.setSearchStatus(hideStatus ? 'result' : 'inload');
      this.canceler = this.$q.defer();

      let self = this;

      this.config.dataMethod(this.page, this.query, {timeout: self.canceler.promise}, res => {
        self.inLoad = res.data.length == 0;

        let $uiSelectController = self.getUiSelectController();

        // NOTE: We not using self.items because it not update
        // items of ui-select; self.items used only in template like placeholder
        // that will get items from controller of ui-select.
        if($uiSelectController){
          if(self.page === self.config.startPage){
            $uiSelectController.items = [];
          }

          for(let item of res.data){
            $uiSelectController.items.push(item);
          }
        }
        self.setSearchStatus((self.page == self.config.startPage) && (res.data.length == 0) ? 'noresult' : 'result');
      });
    }

    setSearchStatus (searchStatus) {
      var self  = this;

      for(let status of ['before', 'noresult', 'inload']){

        self.$element.find('.UiSelectInfinitySearchStatus-' + status)
        .css({'display': (status === searchStatus ? 'block' : 'none')});
      }
    };

    /**
    * @description Returns Controller of ui-select
    * @return {Controller} ui-select controller
    */
    getUiSelectController() {
      let $select2 = this.$element.find('.select2.select2-container');

      return $select2.data().$uiSelectController;
    }
}

UiSelectInfinityCtrl.$inject =['$element', '$q', '$timeout'];

angular.module('app.layout').component('uiSelectInfinity', {
  bindings: {config: '<', onSelect: '&', view: '@', ngModel: '='},
  templateUrl: 'app/layout/components/ui-select-infinity/ui-select-infinity.html',
  controllerAs: '$ctrl',
  controller: UiSelectInfinityCtrl
});
