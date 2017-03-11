/**
 * Created by Egor Lobanov on 19.11.15.
 */
(function(){
    "use strict";
    angular.module('app.templates',[]).run(['$templateCache', function($templateCache) {
        $templateCache.put('typeAhead.tmpl.html', '<a><span ng-bind-html="match.model.label | uibTypeaheadHighlight:query"></span><div class="note" ng-bind-html="match.model.item.value"></div></a>')
    }]);
}());
