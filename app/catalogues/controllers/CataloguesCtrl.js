/**
 * Created by Egor Lobanov on 07.11.15.
 */
(function(){

    'use strict';

    angular.module('app.catalogues').controller('CataloguesCtrl', ['$scope', '$state', '$stateParams', 'serverApi', '$filter', 'funcFactory', function($scope, $state, $stateParams, serverApi, $filter, funcFactory){
        var sc = $scope;
        sc.visual = {
            navButtsOptions:[{
                type: 'new',
                callback: function(){}
            }],
            navTableButts:[
                { type: 'view', callback: viewCatalogue },
                { type: 'table_edit', callback: editCatalogue },
                { type: 'remove', callback: removeCatalogue }
            ]
        };
        sc.data = {
            cataloguesList:[],
            searchQuery:$stateParams.q
        };

        function viewCatalogue(data){
            $state.go('app.catalogues.view', {id:data.id || data._id});
        }
        
        function editCatalogue(data){
            $state.go('app.catalogues.view.edit', {id: (data.id || data._id)});
        }

        function removeCatalogue(data){
            $.SmartMessageBox({
                title: "Удалить категорию?",
                content: "Вы действительно хотите удалить категорию " + data.name,
                buttons: '[Нет][Да]'
            }, function (ButtonPressed) {
                if (ButtonPressed === "Да") {
                    serverApi.deleteCatalogue(data.id, function(result){
                        if(!result.data.errors){
                            sc.data.cataloguesList.splice(data.index,1);
                            funcFactory.showNotification('Категория ' + data.name + ' успешно удалена.', '', true);
                        } else {
                            funcFactory.showNotification('Не удалось удалить категорию ' + data.name, result.data.errors);
                        }
                    });
                }
            });
        }
    }]);
}());