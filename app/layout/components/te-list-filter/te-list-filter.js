class ListFilterCtrl {
    constructor(Observer) {
        this.Observer = Observer;
    }

    filterList(e) {
        if((e.keyCode == 13) || (e.type == 'click')) {
            let self = this;
            this.Observer.notify('FILTER_LIST', {listId: self.listId, filter: self.model});
        }
    }
}

ListFilterCtrl.$inject = ['Observer'];

angular.module('app.layout').component('teListFilter', {
    bindings: {listId: '@'},
    controller: ListFilterCtrl,
    controllerAs: '$ctrl',
    templateUrl: 'app/layout/components/te-list-filter/te-list-filter.html'
});
