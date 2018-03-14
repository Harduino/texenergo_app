class TextsCtrl {
    constructor($state, $stateParams) {
    }
}

TextsCtrl.$inject = ['$state', '$stateParams'];

angular.module('app.texts').component('texts', {
    controller: TextsCtrl,
    controllerAs: '$ctrl',
    templateUrl: '/app/texts/components/texts/texts.html'
});
