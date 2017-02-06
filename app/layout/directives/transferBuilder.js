/**
 * Created by Egor Lobanov on 18.12.15.
 * directive of create transfer form
 */
(function(){
    angular.module('app.layout').component('transferBuilder', {
        bindings: {config: '=', transfersList: '='},
        controller: function(serverApi, funcFactory, $element) {
            var self = this;
            this._modal = $element.find('.modal');

            this.partnerSelectConfig = {dataMethod: serverApi.getPartners};
            this.data = {partnersList: []};
            this.datePickerConfig = {dateFormat: 'dd.mm.yy'};

            this.config.showForm = function() {
                self.clearForm();
                self._modal.modal('show');
            };

            this.clearForm = function () {
                self.newTransfer = {
                    date: new Date(),
                    amount: 0,
                    partner: {},
                    partner_id: '',
                    number: null,
                    description: ''
                };
            };

            this.clearForm();

            this.appendTransfer = function(item) {
                self.transfersList.unshift(item);
                funcFactory.showNotification((item.type === 'IncomingTransfer' ? 'Входящий' : 'Исходящий') +
                    ' платеж успешно добавлен', item.number, true);
            };

            this.createTransfer = function(){
                var data = self.newTransfer;

                if(data.partner) {
                    data.partner_id = data.partner.id;
                }

                delete data.partner;

                self.config.createMethod(data, function(result) {
                    if(!result.data.errors) {
                        if(angular.isArray(result.data)) {
                            result.data.map(self.appendTransfer.bind(self));
                        } else {
                            self.appendTransfer(result.data);
                        }

                        self._modal.modal('hide');
                        self.clearForm();
                    } else {
                        funcFactory.showNotification('Не удалось создать платеж', result.data.errors);
                    }
                }, angular.noop);
            };
        },
        controllerAs: '$ctrl',
        templateUrl: '/app/layout/partials/transfer-builder.tplt.html'
    });
}());
