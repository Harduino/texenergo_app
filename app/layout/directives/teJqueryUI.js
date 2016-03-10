/**
 * Created by Egor lobanov on 06.01.16.
 * directive create Jq UI element with options
 */
(function(){
    var module = angular.module('te-jq-ui', []);

    module.directive('teJqUi', function(){
        return{
            restrict: 'A',
            scope:{
                options: '=teJqUi'
            },
            link: function(scope, element, attrs){
                var type = attrs.uiType;

                if(type && element[type]){

                    var setOptions = function(value){
                        element[type](value||{});
                    };

                    attrs.watchOptions ? scope.$watch('options', function(value){
                            value && setOptions(value);
                        })
                    : setOptions(scope.options);

                    scope.$on('$destroy', function(){
                        element[type]('destroy');
                    })
                }
            }
        };
    });
    module.directive('teJqDatepicker', [ function(){
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, element, attrs, ngModel){

                ngModel.$formatters.push(function(value){
                    if(value){
                        return $.datepicker.formatDate('dd.mm.yy', value);
                    }
                });

                scope.$watch(attrs.ngModel, function(value, oldValue){
                    if(value !== oldValue) {
                        ngModel.$setViewValue(element.datepicker("getDate"));
                    }
                }, true);
            }
        }
    }]);
}());