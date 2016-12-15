/**
 * Created by Mikhail Arzhaev on 07.12.15.
 */
(function(){
    angular.module('app.manufacturers').controller('EditManufacturerCtrl', ['$state', '$stateParams', 'serverApi', '$filter', 'funcFactory', function($state, $stateParams, serverApi, $filter, funcFactory){
        var self = this;
        this.data = {manufacturer: {}};
        this.tinymceOptions = funcFactory.getTinymceOptions();

        this.visual = {
            navButtsOptions:[
                {
                    type: 'back',
                    callback: function() {
                        $state.go('app.manufacturers', $stateParams);
                    }
                },
                {
                    type: 'show',
                    callback: function() {
                        $state.go('app.manufacturers.view', $stateParams);
                    }
                }
            ],
            roles: {}
        };

        serverApi.getManufacturerDetails($stateParams.id, function(result) {
            var manufacturer = self.data.manufacturer = result.data;

            self.visual.roles = {
                can_edit: manufacturer.can_edit,
                can_destroy: manufacturer.can_destroy
            }
        });

        /**
         * Обновляем информацию по категории
         */
        this.saveManufacturer = function() {
            var manufacturer = self.data.manufacturer;
            var data = {
                manufacturer: {
                    name: manufacturer.name,
                    description: manufacturer.description
                }
            };

            serverApi.updateManufacturer(manufacturer.id, data, function(result) {
                if((result.status == 200) && !result.data.errors) {
                    funcFactory.showNotification("Успешно", 'Производитель ' + manufacturer.name +
                        ' успешно отредактирован.', true);
                } else {
                    funcFactory.showNotification("Неудача", 'Не удалось отредактировать производителя ' +
                        manufacturer.name, true);
                }
            });
        };
    }]);
}());
