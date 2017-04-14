
/**
* Usage $event.currentTarget.busy(true/false);
*/
class teBusyButton {

  constructor($element) {
    this.$element = $element;
  }

  $postLink(){

    let elem = this.$element;

    elem[0].busy = (isBusy) => {

      if(isBusy){
        elem.addClass('ng-disabled no-events')
               .attr('disabled', 'disabled');
      }else{
        elem.removeClass('ng-disabled no-events')
               .removeAttr('disabled');
      }

    }
  }

}

teBusyButton.$inject = ['$element'];

angular.module('app.layout').component('teBusyButton', {
  controller: teBusyButton
});
