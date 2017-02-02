class ScrollTopCtrl {
    constructor($scope) {
        this.block = $($scope.selector || window);
        this.slideUp = false;
        this.block.scroll(this.onScroll.bind(this));

        let self = this;
        $scope.$on('$destroy', () => self.block.off('scroll', self.onScroll));
    }

    teScrollTop () {
        this.block.scrollTop(0);
    }

    onScroll () {
        this.slideUp = this.block.scrollTop() >= 2 * this.block.outerHeight();
    }
}

ScrollTopCtrl.$inject = ['$scope'];

angular.module('app.layout').directive('teScrollTop', function() {
    return {
        restrict: 'E',
        scope: {selector: '@', buttonClass: '@'},
        controller: ScrollTopCtrl,
        controllerAs: '$ctrl',
        templateUrl: 'app/layout/components/te-scroll-top/te-scroll-top.html'
    };
});
