/**
 * Created by Egor Lobanov on 21.11.15.
 * Append button to scroll top
 */
(function(){
    angular.module('app.layout').directive('teScrollTop', ['$window', function($window){
        return {
            restrict: 'E',
            link: function(scope, element){
                element.addClass('scroll-up-btn not-selectable');
                scope.teScrollTop = function(){
                    angular.element('body').scrollTop(0);
                };

                var w = $(window);

                w.scroll(onScroll);

                function onScroll() {
                    var top = w.scrollTop(),
                        height = w.height();
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
