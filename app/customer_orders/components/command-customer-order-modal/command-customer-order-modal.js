class CommandCustomerOrderModalCtrl {
    constructor ($uibModalInstance, serverApi, config) {
        this.modalInstance = $uibModalInstance;
        this.serverApi = serverApi;
        this.selectedCommandList = 0;

        this.commandsLists = [
            ['сортировать_по', 'удалить_где'],
            ['сортировать_по артикул']
        ];

        this.config = angular.extend({title: 'Использовать комманду', btnOkText: 'Изменить', btnCancelText: 'Отмена'},
            config);
    }

    selectCommandList (newCommand) {
        if(newCommand !== undefined) {
            for(let commandListIndex = 0; commandListIndex < this.commandsLists.length; commandListIndex++) {
                let commandList = this.commandsLists[commandListIndex];

                for(let commandIndex = 0; commandIndex < commandList.length; commandIndex++) {
                    let command = commandList[commandIndex];

                    if(command.lastIndexOf(newCommand) > -1) {
                        return this.selectedCommandList = commandListIndex;
                    }
                }
            }
        }
    }

    ok () {
        this.modalInstance.close(this.command);
    }

    cancel () {
        this.modalInstance.dismiss('cancel');
    }
}

CommandCustomerOrderModalCtrl.$inject = ['$uibModalInstance', 'serverApi', 'config'];
angular.module('app.customer_orders').controller('CommandCustomerOrderModalCtrl', CommandCustomerOrderModalCtrl);
