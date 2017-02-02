/**
 * Created by Egor Lobanov on 21.11.15.
 * Append button to scroll top
 */
(function(){
    angular.module('app.layout').directive('teScrollTop', ['$parse', function($parse){
        return {
            restrict: 'E',
            scope:{},
            link: function(scope, element, attrs){
                var config = angular.extend({container: window, buttonClass: ''}, $parse(attrs.config || {})());
                element.addClass("scroll-up-btn " + config.buttonClass + ' not-selectable');
                var w = $(config.container);

                var onScroll = function () {
                    if (w.scrollTop() >= 2 * w.outerHeight()) {
                        !element.hasClass('slideUp') && element.addClass('slideUp');
                    } else {
                        element.removeClass('slideUp');
                    }
                };

                w.scroll(onScroll);

                scope.teScrollTop = function() {
                    w.scrollTop(0);
                };

                scope.$on('$destroy', function(){
                   w.off('scroll', onScroll);
                });
            },
            templateUrl: 'app/layout/components/te-scroll-top/te-scroll-top.html'
        };
    }]);
}());
