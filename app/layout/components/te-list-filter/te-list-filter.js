class ListFilterCtrl {
    constructor($timeout, Observer) {
        this.$timeout = $timeout;
        this.Observer = Observer;

        if(this.delay === undefined) {
            this.delay = 500;
        }
    }

    filterList (e, runTimer) {
        if(this.timerId !== undefined) {
            this.$timeout.cancel(this.timerId);
        }

        if((e.keyCode == 13) || (e.type == 'click')) {
            this.applyFilter();
        } else if(runTimer && this.liveLoad) {
            this.timerId = this.$timeout(this.applyFilter.bind(this), this.delay);
        }
    }

    applyFilter () {
        let self = this;
        this.Observer.notify('FILTER_LIST', {listId: self.listId, filter: self.model});
    }
}

ListFilterCtrl.$inject = ['$timeout', 'Observer'];

angular.module('app.layout').component('teListFilter', {
    bindings: {delay: '@', listId: '@', liveLoad: '<'},
    controller: ListFilterCtrl,
    controllerAs: '$ctrl',
    templateUrl: 'app/layout/components/te-list-filter/te-list-filter.html'
});
