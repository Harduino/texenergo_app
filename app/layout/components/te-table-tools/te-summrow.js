// Component provides ability to
// select/unselect table row and add it to Sum
class TeSummRowCtrl{
  constructor($element){
    this.$element = $element;
  }

  onRowClick(event){
    let $currentTarget = $(event.currentTarget);

    if(event.shiftKey){
      let selectedForSumm = this.row.$selectedForSumm;
      let selectedNewValue = !selectedForSumm;

      event.preventDefault();
      event.stopImmediatePropagation();

      if(selectedForSumm){
        this.table.removeFromSumm(this.row);
      }else{
        this.table.addToSumm(this.row);
      }

      this.row.$selectedForSumm = selectedNewValue;
      this.$tr.toggleClass('active', selectedNewValue);
    }
  }

  $postLink(){
    this.$tr = this.$element.parents('tr');
    this.$tr.on('click', this.onRowClick.bind(this));
  }

  $onDestroy(){
    this.table.removeFromSumm(this.row);
    this.$tr.off('click');
  }
}

TeSummRowCtrl.$inject = ['$element'];

angular.module('app.layout').component('teSummarize', {
  controller: TeSummRowCtrl,
  controllerAs: '$teSummarize',
  require: {
    table: '^teTableTools'
  },
  bindings: {row: '<'}
});
