class SearchMobileCtrl {
    constructor($state) {
        this.$state = $state;
        this.searchText = '';
    }

    executeSearch() {
        this.$state.go('app.search', {searchString: this.searchText, page: 0});
    }

    hideSearchForm () {
        $('body').removeClass('search-mobile');
    }

    showSearchForm () {
        $('body').addClass('search-mobile');
    }
}

SearchMobileCtrl.$inject = ['$state'];

angular.module('app.layout').component('searchMobile', {
    templateUrl: '/app/layout/components/search-mobile/search-mobile.html',
    controller: SearchMobileCtrl,
    controllerAs: '$ctrl'
});
