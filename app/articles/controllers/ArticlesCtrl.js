/**
 * Created by Mikhail Arzhaev on 24.12.15.
 */
(function(){

    'use strict';

    angular.module('app.articles').controller('ArticlesCtrl', ['$scope', '$state', '$stateParams', 'serverApi', '$filter', 'funcFactory', function($scope, $state, $stateParams, serverApi, $filter, funcFactory){
        
        var sc = $scope;
        
        sc.visual = {
            navButtsOptions:[{
                type: 'new',
                callback: function(){}
            }],
            navTableButts:[{type:'view', callback: viewArticle}, {type:'table_edit', callback: editArticle}, {type:'remove', callback: removeArticle}]
        };
        
        sc.data = {
            articlesList:[],
            searchQuery:$stateParams.q
        };

        function viewArticle(data){
            $state.go('app.pages.view', {id:data.id || data._id});
        }
        
        function editArticle(data){
            $state.go('app.pages.view.edit', {id: (data.id || data._id)});
        }

        function removeArticle(data){
            $.SmartMessageBox({
                title: "Удалить страницу?",
                content: "Вы действительно хотите удалить страницу " + data.title,
                buttons: '[Нет][Да]'
            }, function (ButtonPressed) {
                if (ButtonPressed === "Да") {
                    serverApi.deletePage(data.id, function(result){
                        if(!result.data.errors){
                            sc.data.pagesList.splice(data.index,1);
                            funcFactory.showNotification('Страница ' + data.title + ' успешно удалена.', '', true);
                        } else {
                            funcFactory.showNotification('Не удалось удалить страницу ' + data.title, result.data.errors);
                        }
                    });
                }
            });
        }
    }]);
}());