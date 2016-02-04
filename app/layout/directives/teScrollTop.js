/**
 * Created by Egor Lobanov on 21.11.15.
 * Append button to scroll top
 */
(function(){
    angular.module('app.layout').directive('teScrollTop', function(){
        return {
            restrict: 'E',
            link: function(scope, element){
                element.addClass('scroll-up-btn not-selectable');
                scope.teScrollTop = function(){
                    angular.element('body').scrollTop(0);
                };
            },
            template: '<div ng-click="teScrollTop()">'+
                '<span class="glyphicon glyphicon-arrow-up"></span>'+
            '</div>'
        };
    });
}());
