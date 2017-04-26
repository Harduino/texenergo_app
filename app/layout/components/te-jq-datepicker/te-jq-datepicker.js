class DatepickerCtrl {
    constructor() {
        if(this.ngModel === undefined) {
            this.ngModel = new Date();
        }

        this.config = angular.extend({dateFormat: 'dd.mm.yy', onSelect: this.setDate.bind(this)}, this.config || {});
        this.initialValue = $.datepicker.formatDate(this.config.dateFormat, this.ngModel);
    }

    setDate (dateText, datepicker) {
        this.ngModel = $(datepicker.input).datepicker('getDate');
    }
}

angular.module('app.layout').component('teJqDatepicker', {
    bindings: {config: '<', label: '@', ngModel: '='},
    controller: DatepickerCtrl,
    controllerAs: '$ctrl',
    templateUrl: '/app/layout/components/te-jq-datepicker/te-jq-datepicker.html'
});
