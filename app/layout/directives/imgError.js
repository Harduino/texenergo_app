/**
 * Created by Egor Lobanov on 23.12.15.
 */
(function(){
    angular.module('app.layout').directive('imgError', function(){
        return {
            restrict: 'AC',
            link: function(scope, element, attrs){
                element.bind('error', function(){
                    attrs.$set('src', attrs.imgError);
                    element.unbind('error');
                });
            }
        }
    });
}());