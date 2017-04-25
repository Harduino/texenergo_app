class TransferBuilderCtrl {
    constructor(serverApi, funcFactory, $element) {
        let self = this;
        this.funcFactory = funcFactory;
        this._modal = $element.find('.modal');

        this.partnerSelectConfig = {dataMethod: serverApi.getPartners};

        this.config.showForm = () => {
            self.clearForm();
            self._modal.modal('show');
        };

        this.clearForm();
    }

    createTransfer () {
        let data = this.newTransfer;
        let self = this;

        if(data.partner) {
            data.partner_id = data.partner.id;
        }

        delete data.partner;

        this.config.createMethod(data, result => {
            if(!result.data.errors) {
                if(angular.isArray(result.data)) {
                    result.data.map(self.appendTransfer.bind(self));
                } else {
                    self.appendTransfer(result.data);
                }

                self._modal.modal('hide');
                self.clearForm();
            } else {
                self.funcFactory.showNotification('Не удалось создать платеж', result.data.errors);
            }
        }, angular.noop);
    }

    clearForm () {
        this.newTransfer = {
            date: new Date(),
            amount: 0,
            partner: {},
            partner_id: '',
            number: null,
            description: ''
        };
    }

    appendTransfer (item) {
        this.transfersList.unshift(item);
        this.funcFactory.showNotification((item.type === 'IncomingTransfer' ? 'Входящий' : 'Исходящий') +
            ' платеж успешно добавлен', item.number, true);
    }
}

TransferBuilderCtrl.$inject = ['serverApi', 'funcFactory', '$element'];

angular.module('app.layout').component('transferBuilder', {
    bindings: {config: '=', transfersList: '='},
    controller: TransferBuilderCtrl,
    controllerAs: '$ctrl',
    templateUrl: '/app/layout/components/transfer-builder/transfer-builder.html'
});
