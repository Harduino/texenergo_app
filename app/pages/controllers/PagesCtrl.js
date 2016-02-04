/**
 * Created by Mikhail Arzhaev on 24.12.15.
 */
(function(){

    'use strict';

    angular.module('app.pages').controller('PagesCtrl', ['$scope', '$state', '$stateParams', 'serverApi', '$filter', 'funcFactory', function($scope, $state, $stateParams, serverApi, $filter, funcFactory){
        
        var sc = $scope;
        
        sc.visual = {
            navButtsOptions:[{
                type: 'new',
                callback: function(){}
            }],
            navTableButts:[{type:'view', callback: viewPage}, {type:'table_edit', callback: editPage}, {type:'remove', callback: removePage}]
        };
        
        sc.data = {
            pagesList:[],
            searchQuery:$stateParams.q
        };

        function viewPage(data){
            console.log('page', data);
            $state.go('app.pages.view', {id:data.id || data._id});
        }
        
        function editPage(data){
            $state.go('app.pages.view.edit', {id: (data.id || data._id)});
        }

        function removePage(data){
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