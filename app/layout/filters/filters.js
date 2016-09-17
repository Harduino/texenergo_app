/**
 * Created by Egor Lobanov on 28.11.15.
 * App filters
 */
(function(){

    var module = angular.module('app.layout');

    module.directive('modelFilter', ['$filter', function($filter){
        return {
            restrict:'A',
            require:'ngModel',
            link:function(scope, element, attrs, c){
                var params = {};

                scope.$watch(attrs.modelFilter, function(value){
                    params = value;
                }, true);

                scope.$watch(attrs.ngModel, function(value, oldValue){
                    if(value !== oldValue) {
                        c.$setViewValue($filter(attrs.filterName)(value, params));
                        c.$render();
                    }
                });
            }
        }
    }]);

    module.filter('price_net', function(){
        return function(item, multiplier){
            var value = 0;
            if(item.hasOwnProperty('price')){
                value = item.price * (item.hasOwnProperty('discount') ?  (1 - item.discount/100) : 1);
                value = Math.round(value * 100) / 100;
                if(multiplier>=0) value*=multiplier;
            }
            return value;
        };
    });

    module.filter('te_number', function(){
        return function(value, params){
            var strValue = (value || '').toString(),
                typeIsNumber = params.hasOwnProperty('number');
            if(strValue === '' || (typeIsNumber && strValue.indexOf('.')==strValue.length-1 || typeIsNumber && strValue[strValue.length-1] == '0'))
                return value;
            var v  = (params.hasOwnProperty('number') ? parseFloat : parseInt)(value || 0) || 0;
            if(params.hasOwnProperty('min') && v<params.min) return params.min;
            if(params.hasOwnProperty('max') && v>params.max) return params.max;
            return v;
        }
    });
}());