/**
 * Created by Egor Lobanov on 21.11.15.
 * Append button to scroll top
 */
(function(){
    angular.module('app.layout').directive('teScrollTop', function() {
        return {
            restrict: 'E',
            scope: {selector: '@', buttonClass: '@'},
            controller: function($scope) {
                let block = $($scope.selector || window);
                let onScroll = () => $scope.slideUp = block.scrollTop() >= 2 * block.outerHeight();

                block.scroll(onScroll);
                $scope.teScrollTop = () => block.scrollTop(0);
                $scope.$on('$destroy', () => block.off('scroll', onScroll));
            },
            templateUrl: 'app/layout/components/te-scroll-top/te-scroll-top.html'
        };
    });
}());
