class ScrollTopCtrl {
    constructor($scope) {
        this.block = $($scope.selector || window);
        this.block.scroll(this.setVisibility.bind(this));

        let self = this;
        $scope.$on('$destroy', () => self.block.off('scroll', self.setVisibility.bind(self)));
    }

    scrollTop () {
        this.block.scrollTop(0);
    }

    setVisibility () {
        this.visible = this.block.scrollTop() >= 2 * this.block.outerHeight();
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
