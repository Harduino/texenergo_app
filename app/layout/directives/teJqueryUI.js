/**
 * Created by Egor lobanov on 06.01.16.
 * directive create Jq UI element with options
 */
(function(){
    var module = angular.module('te-jq-ui', []);

    module.directive('teJqUi', function(){
        return {
            restrict: 'A',
            scope:{
                options: '=teJqUi'
            },
            link: function(scope, element, attrs) {
                var type = attrs.uiType;

                if(type && element[type]) {
                    element[type](scope.options || {});

                    scope.$on('$destroy', function(){
                        element[type]('destroy');
                    })
                }
            }
        };
    });
}());