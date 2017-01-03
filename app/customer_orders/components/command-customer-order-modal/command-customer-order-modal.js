class CommandCustomerOrderModalCtrl {
    constructor (serverApi) {
        this.serverApi = serverApi;
        this.selectedCommandList = 0;

        this.commandsLists = [
            ['сортировать_по', 'удалить_где'],
            ['сортировать_по артикул']
        ];

        this.resolve.config = angular.extend({
            title: 'Использовать комманду',
            btnOkText: 'Изменить',
            btnCancelText: 'Отмена'
        }, this.resolve.config);
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

CommandCustomerOrderModalCtrl.$inject = ['serverApi'];

angular.module('app.customer_orders').component('commandCustomerOrderModal', {
    controller: CommandCustomerOrderModalCtrl,
    controllerAs: '$ctrl',
    bindings: {modalInstance: "<", resolve: "<"},
    templateUrl: 'app/customer_orders/components/command-customer-order-modal/command-customer-order-modal.html'
});
