/**
 * Created by Egor Lobanov on 21.11.15.
 * Helps init infinite-scroll by default app params
 */
(function(){
    angular.module('app.layout').directive('teLazyHelper', ['serverApi', '$timeout', '$parse', function(serverApi, $timeout, $parse){
        return {
            restrict:'A',
            scope:{
                list:'=',
                searchQuery:'='
            },
            link: function(scope, element, attrs){
                var pageNumber = attrs.hasOwnProperty('startPage') ? parseInt(attrs.startPage) : 1,
                    startPage = pageNumber,// номер загружаемой страницы;
                    loader = angular.element('<div class="font-lg text-align-center"><i class="fa fa-gear fa-spin"></i> Загрузка...</div>');

                scope.loadList = function(){
                    attrs.$set('infiniteScrollDisabled', true); //даем infiniteScroll знать что ждем загрузку данных
                    setVisualStatus(true);
                    (serverApi[attrs.serverApiMethod] || $parse(attrs.serverApiMethod)(scope.$parent))(pageNumber, scope.searchQuery, {}, function(result){
                        var stop = result.data.length == 0;
                        setVisualStatus(false, stop && pageNumber == startPage);
                        scope.list = scope.list.concat(result.data); //склеиваем уже загруженные данные и вновь прибывшие
                        pageNumber++; //увеличиваем номер листа
                        $timeout(function(){
                            attrs.$set('infiniteScrollDisabled', stop);// даем infiniteScroll знать что данные загружены если данных пришло меньше 20 подгрузка завершается
                        },10);
                    });
                };

                function setVisualStatus(inLoad, noResults){
                    inLoad ? element.after(loader) : loader.remove();
                    noResults && element.after('<div class="font-lg text-align-center">Нет результатов.</div>');
                }

                attrs.$set('infiniteScroll', scope.loadList);
            }
        };
    }]);
}());
