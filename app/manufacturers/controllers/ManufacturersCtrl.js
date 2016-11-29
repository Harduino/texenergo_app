/**
 * Created by Mikhail Arzhaev on 20.11.15.
 */
(function(){

    'use strict';

    angular.module('app.manufacturers').controller('ManufacturersCtrl', ['$state', '$stateParams', 'serverApi', 'funcFactory', function($state, $stateParams, serverApi, funcFactory){
        var self = this;

        this.visual = {
            navButtsOptions:[
                {type: 'new', callback: function(){}}
            ],
            navTableButts:[
                {
                    type: 'view',
                    callback: function(item) {
                        $state.go('app.manufacturers.view', {id:item.data.id || item.data._id});
                    }
                },
                {
                    type: 'table_edit',
                    callback: function(item) {
                        $state.go('app.manufacturers.view.edit', {id:item.data.id || item.data._id});
                    }
                },
                {
                    type: 'remove',
                    callback: function(item) {
                        var data = item.data;

                        $.SmartMessageBox({
                            title: 'Удалить производителя?',
                            content: "Вы действительно хотите удалить производителя " + data.name,
                            buttons: '[Нет][Да]'
                        }, function (ButtonPressed) {
                            if (ButtonPressed === "Да") {
                                serverApi.deleteManufacturer(data.id, function(result) {
                                    if(!result.data.errors){
                                        self.data.manufacturersList.splice(item.index,1);
                                        funcFactory.showNotification('Производитель ' + data.name + ' успешно удален.',
                                            '', true);
                                    } else {
                                        funcFactory.showNotification('Не удалось удалить производителя ' + data.name,
                                            result.data.errors);
                                    }
                                });
                            }
                        });
                    }
                }
            ]
        };

        this.data = {manufacturersList:[], searchQuery:$stateParams.q};
    }]);
}());
