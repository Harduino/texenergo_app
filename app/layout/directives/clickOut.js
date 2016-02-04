/** 
 * Created by Sergey Baev on 06.12.15.
 * Execute an angular expression when we click out of the current element
 */
(function(){
    angular.module('app.layout').directive('clickOut', ['$window', '$parse', function ($window, $parse) {
        return {
          restrict: 'A',
          link: function (scope, element, attrs) {
            var clickOutHandler = $parse(attrs.clickOut);

              function handleClick(event) {
                  if (element[0].contains(event.target) || event.target.contains(element[0]) || !$window.document.contains(event.target))
                      return;

                  clickOutHandler(scope, {$event: event});
                  !scope.$$phase && scope.$apply();
              }

            var w = angular.element($window).on('click', handleClick);

            scope.$on('$destroy', function(){
                w.off('click', handleClick);
            });
          }
        };
    }]);
}());