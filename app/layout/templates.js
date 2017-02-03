/**
 * Created by Egor Lobanov on 19.11.15.
 */
(function(){
    "use strict";

    angular.module('app.templates',[]).run(['$templateCache', function($templateCache) {
        $templateCache.put('formNavButtons.tmpl.html',
            '<div ng-repeat="item in buttons track by $index" ng-if="item.hasOwnProperty(\'disabled\') || !item.role || role[item.role] === true" ng-disabled="item.disabled" ng-class="item.class" ng-click="buttonClick(item)">'+
                '<i class="fa fa-{{item.ico}}"></i><span class="hidden-xs" ng-if="showText()">{{ item.name }}</span>'+
            '</div>'
        );

        $templateCache.put('typeAhead.tmpl.html', '<a><span ng-bind-html="match.model.label | uibTypeaheadHighlight:query"></span><div class="note" ng-bind-html="match.model.item.value"></div></a>')
    }]);
}());
