'use strict';

angular.module('app.customer_orders')
    .controller('CommandCustomerOrderModalCtrl', ['$uibModalInstance', 'serverApi', 'config', function($uibModalInstance, serverApi, config) {
        var self = this;
        this.selectedCommandList = 0;
    
        this.commandsLists = [
            ['сортировать_по', 'удалить_где'],
            ['сортировать_по артикул']
        ];

        this.selectCommandList = function(newCommand) {
            if(newCommand !== undefined) {
                for(var commandListIndex = 0; commandListIndex < self.commandsLists.length; commandListIndex++) {
                    var commandList = self.commandsLists[commandListIndex];

                    for(var commandIndex = 0; commandIndex < commandList.length; commandIndex++) {
                        var command = commandList[commandIndex];

                        if(command.lastIndexOf(newCommand) > -1) {
                            return self.selectedCommandList = commandListIndex;
                        }
                    }
                }
            }
        };
    
        this.config = angular.extend({title: 'Использовать комманду', btnOkText: 'Изменить', btnCancelText: 'Отмена'},
            config);
    
        this.ok = function () {
            $uibModalInstance.close(self.command);
        };
    
        this.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }])
;
