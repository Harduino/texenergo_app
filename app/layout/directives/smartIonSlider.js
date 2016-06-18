/**
 * Created by egorlobanov on 17.06.16.
 */
(function(){
    angular.module('app.layout').directive('smartIonslider', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs){
                var unobserve = attrs.$observe('smartIonslider', function(value){
                    if(value) {
                        element.ionRangeSlider($parse(value)(scope));
                        attrs.hasOwnProperty('unWatch') && unobserve();
                    }
                });
            }
        }
    }]);
}());