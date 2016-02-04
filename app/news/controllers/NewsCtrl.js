/**
 * Created by Mikhail Arzhaev on 24.12.15.
 */
(function(){

    'use strict';

    angular.module('app.news').controller('NewsCtrl', ['$scope', '$state', '$stateParams', 'serverApi', '$filter', 'funcFactory', function($scope, $state, $stateParams, serverApi, $filter, funcFactory){
        
        var sc = $scope;
        
        sc.visual = {
            navButtsOptions:[{
                type: 'new',
                callback: function(){}
            }],
            navTableButts:[{type:'view', callback: viewNews}, {type:'table_edit', callback: editNews}, {type:'remove', callback: removeNews}]
        };
        
        sc.data = {
            newsList:[],
            searchQuery:$stateParams.q
        };

        function viewNews(data){
            $state.go('app.news.view', {id:data.id || data._id});
        }
        
        function editNews(data){
            $state.go('app.news.view.edit', {id: (data.id || data._id)});
        }

        function removeNews(data){
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