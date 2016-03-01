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
                var config = angular.extend({
                    container: window,
                    buttonClass: ""
                }, $parse(attrs.config || {})());

                element.addClass("scroll-up-btn " + config.buttonClass + ' not-selectable');
                scope.teScrollTop = function(){
                    w.scrollTop(0);
                };

                var w = $(config.container);

                w.scroll(onScroll);

                function onScroll() {
                    var top = w.scrollTop(),
                        height = w.outerHeight();
                    if(top>=height*2){
                        !element.hasClass('slideUp') && element.addClass('slideUp');
                    }else element.removeClass('slideUp');
                }

                scope.$on('$destroy', function(){
                   w.off('scroll', onScroll);
                });
            },
            template: '<div ng-click="teScrollTop()">'+
                '<span class="glyphicon glyphicon-arrow-up"></span>'+
            '</div>'
        };
    }]);
}());
