'use strict';

angular.module('app.customer_orders')
    .controller('CommandCustomerOrderModalCtrl', ['$scope', '$uibModalInstance', 'serverApi', 'config', function($scope, $uibModalInstance, serverApi, config) {
        var sc = $scope;
    
        sc.commandsLists = [
            ['сортировать_по', 'удалить_где'],
            ['сортировать_по артикул']
        ];
        sc.commandsLists.selectedList = 0;
    
        sc.$watch('command', function(newCommand, oldCommand){
            if(newCommand !== undefined) {
                var ctrl = angular.element('#vco_typeahead').data().$ngModelController;
    
                if(newCommand.lastIndexOf('§') > -1) {
                    ctrl.$setViewValue(oldCommand);
                }
    
                for(var commandListIndex = 0; commandListIndex < sc.commandsLists.length; commandListIndex++) {
                    var commandList = sc.commandsLists[commandListIndex];
    
                    for(var commandIndex = 0; commandIndex < commandList.length; commandIndex++) {
                        var command = commandList[commandIndex];
    
                        if(command.lastIndexOf(newCommand) > -1) {
                            sc.commandsLists.selectedList = commandListIndex;
    
                            if(sc.commandsLists.selectedList !== commandListIndex) {
                                ctrl.$setViewValue(newCommand + '§');
                            }
    
                            return;
                        }
                    }
                }
            }
        });
    
        sc.config = angular.extend({itle: 'Использовать комманду', btnOkText: 'Изменить', btnCancelText: 'Отмена'},
            config);
    
        sc.ok = function () {
            $uibModalInstance.close(sc.command);
        };
    
        sc.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }])
;
