/**
 * Created by Egor lobanov on 06.01.16.
 * directive create Jq UI element with options
 */
(function(){
    angular.module('app.layout').directive('teJqUi', function(){
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

                    attrs.watchOptions ? scope.watch('options', function(value){
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
}());