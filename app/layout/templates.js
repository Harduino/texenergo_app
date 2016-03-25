/**
 * Created by Egor Lobanov on 19.11.15.
 */
(function(){

    "use strict";

    var module = angular.module('app.templates',[]);

    module.run(['$templateCache', function($templateCache){

        $templateCache.put('ordersFilter.tmpl.html',
            '<div class="smart-form col-xs-12 col-md-6 col-lg-5 no-padding">'+
                '<section>'+
                    '<label class="label">Запрос</label>'+
                    '<label class="input">'+
                        '<input type="text" ng-model="searchQuery" placeholder="Введите часть номера" class="input-sm" ng-keypress="exeSearch($event)">'+
                    '</label>'+
                '</section>'+
            '</div>'+
            '<button class="btn btn-primary un-float margin-bottom-10" ng-click="exeSearch()">'+
                '<i class="fa fa-search"></i> Поиск'+
            '</button>'
        );

        $templateCache.put('formNavButtons.tmpl.html',
            '<div ng-repeat="item in buttons track by $index" ng-if="item.hasOwnProperty(\'disabled\') || !item.role || role[item.role] === true" ng-disabled="item.disabled" ng-class="item.class" ng-click="buttonClick(item)">'+
                '<i class="fa fa-{{item.ico}}"></i><span class="hidden-xs" ng-if="showText()">{{ item.name }}</span>'+
            '</div>'
        );
    }]);
}());
