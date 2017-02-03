(function () {

    'use strict';

    angular.module('app.layout').directive('hrefVoid', function () {
        return {
            restrict: 'A',
            link: function (scope, element) {
                element.attr('href','#');
                element.on('click', function(e){
                    e.preventDefault();
                    e.stopPropagation();
                })
            }
        }
    })
    .directive('navTabs', function(){
        return {
            restrict: 'E',
            link: function(scope, element) {
                element.find('a[data-toggle="tab"]').each(function(ind, link){
                    var l = $(link);
                    l.attr('data-target', l.attr('href')).removeAttr('href');
                });
            }
        };
    });
}());
