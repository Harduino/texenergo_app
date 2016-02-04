/**
 * Created by Egor Lobanov on 19.11.15.
 * UI для фильтрации по документам
 * атрибут to-state - определяет к какому стейту нужно перейти для выполнения поиска
 */
(function(){
    angular.module('app.layout').directive('ordersFilter', ['$templateCache', '$state', function($templateCache, $state){
        return {
            restrict:'EA',
            scope:{
                searchQuery:'='//поисковый запрос
            },
            link: function(scope, element, attrs){
                var transitionTo = function(){
                    var q = scope.searchQuery;
                    $state.transitionTo(attrs.toState, q?{q:q}:{}, {reload:true});
                };
                scope.exeSearch = function(e){
                    if(e){
                        e.keyCode == 13 && transitionTo();
                    }else transitionTo();
                };
            },
            template:$templateCache.get('ordersFilter.tmpl.html')
        }
    }]);
}());
