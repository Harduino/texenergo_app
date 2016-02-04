/**
 * Created by Mikhail Arzhaev on 20.11.15.
 */
(function(){

    'use strict';

    angular.module('app.pdf_catalogues').controller('PdfCataloguesCtrl', ['$scope', '$state', '$stateParams', 'serverApi', 'CanCan', 'funcFactory', function($scope, $state, $stateParams, serverApi, CanCan, funcFactory){
        var sc = $scope;
        sc.visual = {
            navButtsOptions:[{
                type: 'new',
                callback: function(){}
            }],
            navTableButts:[{type:'view', callback:viewPdfCatalogue}, {type:'table_edit'}, {type:'remove', callback:removePdfCatalogue}],
            role:{
                can_edit: CanCan.can('edit', 'pdf_catalogues'),
                can_destroy: CanCan.can('destroy', 'pdf_catalogues')
            }
        };

        sc.data = {
            pdfCataloguesList:[],
            searchQuery:$stateParams.q
        };

        function viewPdfCatalogue(item){
            $state.go('app.pdf_catalogues.view', {id:item.data.id || item.data._id});
        }

        function removePdfCatalogue(item){
            var title = item.data.title;
            $.SmartMessageBox({
                title: "Удалить PDF каталог?",
                content: "Вы действительно хотите удалить PDF каталог " + title,
                buttons: '[Нет][Да]'
            }, function (ButtonPressed) {
                if (ButtonPressed === "Да") {
                    serverApi.deletePdfCatalogue(item.data.id, function(result){
                         if(!result.data.errors){
                             funcFactory.showNotification('Успешно', 'Каталог ' + title + ' удален!', true);
                             sc.data.pdfCataloguesList.splice(item.index, 1);
                         }else funcFactory.showNotification('Не удалось удалить PDF каталог', result.data.errors);
                    });
                }
            });
        }
    }]);
}());