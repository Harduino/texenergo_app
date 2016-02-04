/**
 * Created by Mikhail Arzhaev on 20.11.15.
 */
(function(){

    'use strict';

    angular.module('app.manufacturers').controller('ManufacturersCtrl', ['$scope', '$state', '$stateParams', 'serverApi', 'funcFactory', function($scope, $state, $stateParams, serverApi, funcFactory){
        var sc = $scope;
        sc.visual = {
            navButtsOptions:[{
                type: 'new',
                callback: function(){}
            }],
            navTableButts:[{type:'view', callback:viewManufacturer}, {type:'table_edit', callback: editManufacturer}, {type:'remove', callback:removeManufacturer}]
        };
        sc.data = {
            manufacturersList:[],
            searchQuery:$stateParams.q
        };

        function viewManufacturer(item){
            $state.go('app.manufacturers.view', {id:item.data.id || item.data._id});
        }
        
        function editManufacturer(item){
            $state.go('app.manufacturers.view.edit', {id:item.data.id || item.data._id});
        }

        function removeManufacturer(item){
            var data = item.data;
            $.SmartMessageBox({
                title: "Удалить производителя?",
                content: "Вы действительно хотите удалить производителя " + data.name,
                buttons: '[Нет][Да]'
            }, function (ButtonPressed) {
                if (ButtonPressed === "Да") {
                    serverApi.deleteManufacturer(data.id, function(result){
                        if(!result.data.errors){
                            sc.data.manufacturersList.splice(item.index,1);
                            funcFactory.showNotification('Производитель ' + data.name + ' успешно удален.', '', true);
                        } else {
                            funcFactory.showNotification('Не удалось удалить производителя ' + data.name, result.data.errors);
                        }
                    });
                }
            });
        }
    }]);
}());