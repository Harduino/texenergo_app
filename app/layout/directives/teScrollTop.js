/**
 * Created by Egor Lobanov on 21.11.15.
 * Append button to scroll top
 */
(function(){
    angular.module('app.layout').directive('teScrollTop', ['$parse', function($parse) {
        return {
            restrict: 'E',
            scope: {},
            link: function($scope, element, attrs) {
                let config = angular.extend({container: window, buttonClass: ''}, $parse(attrs.config || {})());
                $scope.buttonClass = config.buttonClass;
                let block = $(config.container);

                let onScroll = () => $scope.slideUp = block.scrollTop() >= 2 * block.outerHeight();
                block.scroll(onScroll);
                $scope.teScrollTop = () => block.scrollTop(0);
                $scope.$on('$destroy', () => block.off('scroll', onScroll));
            },
            templateUrl: 'app/layout/components/te-scroll-top/te-scroll-top.html'
        };
    }]);
}());
