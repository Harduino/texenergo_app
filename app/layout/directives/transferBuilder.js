/**
 * Created by Egor Lobanov on 18.12.15.
 * directive of create transfer form
 */
(function(){
    angular.module('app.layout').directive('transferBuilder', ['serverApi', 'funcFactory', '$filter', function(serverApi, funcFactory, $filter){
        return {
            restrict: 'E',
            scope:{
                config: '=',
                transfersList: '='
            },
            link: function(scope, element, attrs){
                var _modal = element.find('.modal');

                scope.partnerSelectConfig ={
                    dataMethod: serverApi.getPartners
                };

                scope.data = {
                    partnersList:[]
                };

                scope.config.showForm = function(){
                    clearForm();
                    _modal.modal('show');
                };

                scope.dateDrop = {
                    opened: false,
                    open: function() {
                        scope.dateDrop.opened = true;
                    }
                };

                clearForm();

                scope.createTransfer = function(){
                    var data = scope.newTransfer;
                    if(data.partner) data.partner_id = data.partner.id;
                    delete data.partner;

                    var appendTransfer = function(item){
                        scope.transfersList.unshift(item);
                        funcFactory.showNotification((item.type === 'IncomingTransfer' ? 'Входящий' : 'Исходящий') + ' платеж успешно добавлен', item.number, true);
                    };

                    scope.config.createMethod(data, function(result){
                        if(!result.data.errors){
                            angular.isArray(result.data) ? result.data.map(function(item){
                                appendTransfer(item);
                            }) : appendTransfer(result.data);

                            _modal.modal('hide');
                            clearForm();
                        }else funcFactory.showNotification('Не удалось создать платеж', result.data.errors);
                    }, angular.noop);
                };

                function clearForm(){
                    scope.newTransfer = {
                        date: $filter("date")(new Date(), 'dd.MM.yyyy'),
                        amount:0,
                        partner:{},
                        partner_id:'',
                        number: null,
                        description: ''
                    };
                    scope.dateDrop.maxDate = scope.newTransfer.date;
                }
            },
            templateUrl: '/app/layout/partials/transfer-builder.tplt.html'
        }
    }]);
}());