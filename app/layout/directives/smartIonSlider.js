/**
 * Created by egorlobanov on 17.06.16.
 */
(function(){
    angular.module('app.layout').directive('smartIonslider', function (lazyScript) {
        return {
            restrict: 'A',
            compile: function (element, attributes) {
                element.removeAttr('smart-ionslider data-smart-ionslider');

                element.ionRangeSlider();
            }
        }
    });
}());