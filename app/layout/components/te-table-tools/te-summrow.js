class TeSummRowCtrl{
  constructor($element){
    this.$element = $element;
  }

  onRowClick(event){
    let $currentTarget = $(event.currentTarget);

    if(event.shiftKey){
      let selectedForSumm = this.row.$selectedForSumm;

      event.preventDefault();
      event.stopImmediatePropagation();

      console.log('click on ', event, this.row);

      if(selectedForSumm){
        this.table.removeFromSumm(this.row);
      }else{
        this.table.addToSumm(this.row);
      }

      this.row.$selectedForSumm = !selectedForSumm;
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

// angular.module('app.layout').directive('teSummarize', () => {
//   return {
//     controller: TeSummarizeCtrl,
//     controllerAs: '$teSummarize',
//     require: {
//       table: '^teTableTools'
//     },
//     link: function(scope, element, attrs, require){
//
//     }
//   };
// });
