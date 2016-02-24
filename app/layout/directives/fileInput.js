/**
 * Created by Egor Lobanov on 10.01.16.
 */
(function(){

    angular.module('app.layout').directive('fileInput', [
            '$parse',
            function ($parse) {
                return {
                    restrict: 'A',
                    link: function(scope, element, attrs) {
                        var handler = $parse(attrs.fileInput)(scope);
                        var isModel = typeof handler !== 'function';

                        element.bind('change', function(){

                            scope.$apply(function(){
                                var files = element[0].files;
                                if(!attrs.multiple) files = files[0];
                                returnFile(files);
                            });
                        });

                        function returnFile(files){
                            isModel ? handler.assign(scope, files) : handler(files);
                        }

                        scope.$on('$destroy', function(){
                            element.unbind();
                        });
                    }
                };
            }
        ]);
}());