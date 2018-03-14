class ViewTextCtrl {
    constructor($state, $stateParams) {
    }
}

ViewTextCtrl.$inject = ['$state', '$stateParams'];

angular.module('app.texts').component('viewText', {
    controller: ViewTextCtrl,
    controllerAs: '$ctrl',
    templateUrl: '/app/texts/components/view-text/view-text.html'
});
