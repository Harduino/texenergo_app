// Dropdown button
//
// Example of usage:
//
// <dropdown-button>
//   <button class="btn btn-primary" >
//       Action <span class="caret"></span>
//   </button>
//   <ul class="dropdown-menu">
//     <li>
//         <a href-void>Action</a>
//     </li>
//     <li class="divider"></li>
//     <li>
//         <a href-void>Separated link</a>
//     </li>
//   </ul>
// </dropdown-button>

class DropdownButton{
  constructor($element, $timeout){

    let self = this;

    this.isOpen = false;
    this.$element = $element;

    // toggle visibility of dropdown menu
    this.open = () => {
      this.isOpen = !this.isOpen;

      if(this.isOpen) $(document).on('click', this.onClickOutside);
      else $(document).off('click', this.onClickOutside);
    };

    this.onClickOutside = (event) => {

      let $target = $(event.target);

      if(!$target.closest(this.$element).length ||
          $target.closest(this.$element.find('li')).length){

        // little trick to start check cycle outside of angular context
        $timeout( ()=>{
          self.open();
        },0);
      }
    };
  }

  $postLink(){
    this.$element.addClass('btn-group dropdown');
  }

  $onDestroy(){
    $(document).off('click', this.onClickOutside);
  }
}

DropdownButton.$inject = ['$element', '$timeout'];

angular.module('app.layout').component('dropdownButton', {
  controller: DropdownButton,
  controllerAs: '$dropButton',
  transclude: {
    button: 'button',
    menu: 'ul'
  },
  template: `
    <div ng-transclude="button" ng-click="$dropButton.open()"></div>
    <div ng-transclude="menu" ng-class="{open: $dropButton.isOpen}"></div>
  `
});
