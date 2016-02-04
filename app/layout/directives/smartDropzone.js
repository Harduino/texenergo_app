(function () {

    'use strict';

    angular.module('app.layout').directive('smartDropzone', function () {
        return {
            restrict: 'A',
            scope:{
                options:'=smartDropzone'
            },
            link:function(scope, element){
                var config = {
                    addRemoveLinks : true,
                    dictCancelUpload: 'Отменить',
                    dictRemoveFile: 'Удалить',
                    dictDefaultMessage: '<span class="font-lg"><i class="fa fa-caret-right text-danger"></i> Перетащите файл для загрузки <br>(или Нажмите)</span>',
                    dictResponseError: 'Ошибка загрузки файла!',
                    headers: {
                        'X-CSRF-Token': $('meta[name=csrf-token]').attr('content'),
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                };

                scope.$watch('options', function(value){
                    if(value){
                        element.dropzone(angular.extend(config, value));
                    }
                })
            }
        }
    });
}());
