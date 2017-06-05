// Component creates toggle button
// Usage: <te-switcher ng-model="selected"></te-switcher>
class TeSwitcher{
  constructor(){
  }

  onClick($event){
    $event.preventDefault();
    $event.stopImmediatePropagation();

    var model = this.model;

    model.$setViewValue(!model.$viewValue);
    model.$render();
  }
}

angular.module('app.layout').component('teSwitcher', {
  controllerAs: '$teSwitcher',
  controller: TeSwitcher,
  // bindings: {model: '='},
  require: {
    model:'^ngModel'
  },
  template: `
    <span class="onoffswitch" ng-click="$teSwitcher.onClick($event)">
      <input type="checkbox" ng-model="$teSwitcher.model.$modelValue" class="onoffswitch-checkbox">
      <label class="onoffswitch-label">
        <span class="onoffswitch-inner"></span>
        <span class="onoffswitch-switch"></span>
      </label>
    </span>
  `
});
