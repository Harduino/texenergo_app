/**
 * Created by Egor Lobanov on 19.11.15.
 * UI для фильтрации по документам
 * атрибут to-state - определяет к какому стейту нужно перейти для выполнения поиска
 */
(function(){
    angular.module('app.layout').directive('ordersFilter', ['$templateCache', '$state', function($templateCache, $state) {
        return {
            restrict: 'E',
            scope: {searchQuery: '=', toState: '@'},
            link: function($scope) {
                $scope.exeSearch = function(e) {
                    if(!e || (e.keyCode == 13)) {
                        var query = $scope.searchQuery;
                        $state.transitionTo($scope.toState, query ? {q: query} : {}, {reload: true});
                    }
                };
            },
            template: $templateCache.get('ordersFilter.tmpl.html')
        }
    }]);
}());
