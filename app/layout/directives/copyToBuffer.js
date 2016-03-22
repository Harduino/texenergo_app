/**
 * Created by Egor Lobanov on 22.03.16.
 * Использование:
 * Добавить к элементу атрибут te-copy-to-buffer
 * Дочерние элементы из которых необходимо скопировать значение,
 * необходимо пометить атрибутом te-buffer-value
 */
(function(){

    "use strict";

    angular.module('teBuffer', []).directive('teCopyToBuffer', [function(){
        return {
            restrict: 'A',
            transclude: true,
            link: function(sc, element, attrs){
                var input = element.find(".te-c-buffer-input");
                sc.copy = function(){
                    var value = "",
                        vals = element.find("[te-buffer-value='']"),
                        length = vals.length;

                    vals.each(function(index, item){
                        var name = item.nodeName,
                            method = (name === "INPUT" || name === "TEXTAREA" ? 'val' : 'html'),
                            separator = (length>1 && index !== length-1 ? " | " : "");

                        value += $(item)[method]() + separator;
                    });
                    input.val(value);
                    input.focus();
                    input.select();
                    document.execCommand('copy');
                };
            },
            template: '<ng-transclude></ng-transclude>' +
                '<i class="fa fa-copy te-c-to-buffer-ico" ng-click="copy()">' +
                '<input class="te-c-buffer-input" type="text">' +
                '</i>'
        }
    }]);
}());