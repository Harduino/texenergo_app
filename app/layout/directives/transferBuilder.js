/**
 * Created by Egor Lobanov on 18.12.15.
 * directive of create transfer form
 */
(function(){
    angular.module('app.layout').component('transferBuilder', {
        bindings: {config: '=', transfersList: '='},
        controller: function(serverApi, funcFactory, $scope, $element) {
            var self = this;
            var _modal = $element.find('.modal');

            $scope.partnerSelectConfig = {dataMethod: serverApi.getPartners};
            $scope.data = {partnersList: []};
            $scope.datePickerConfig = {dateFormat: 'dd.mm.yy'};

            this.config.showForm = function() {
                clearForm();
                _modal.modal('show');
            };

            clearForm();

            $scope.createTransfer = function(){
                var data = $scope.newTransfer;

                if(data.partner) {
                    data.partner_id = data.partner.id;
                }

                delete data.partner;

                var appendTransfer = function(item) {
                    self.transfersList.unshift(item);
                    funcFactory.showNotification((item.type === 'IncomingTransfer' ? 'Входящий' : 'Исходящий') + ' платеж успешно добавлен', item.number, true);
                };

                self.config.createMethod(data, function(result) {
                    if(!result.data.errors) {
                        angular.isArray(result.data) ? result.data.map(appendTransfer) : appendTransfer(result.data);
                        _modal.modal('hide');
                        clearForm();
                    } else {
                        funcFactory.showNotification('Не удалось создать платеж', result.data.errors);
                    }
                }, angular.noop);
            };

            function clearForm() {
                $scope.newTransfer = {
                    date: new Date(),
                    amount: 0,
                    partner: {},
                    partner_id: '',
                    number: null,
                    description: ''
                };
            }
        },
        templateUrl: '/app/layout/partials/transfer-builder.tplt.html'
    });
}());
