// Provides ability to summarize table rows
// Usage:
// <te-table-tools summ-by="<value>" track-by="<value>"
//    result-filter="<value>" summ-fn="<value>" template="<value>">
//   <table>
//     <thead></thead>
//     <tbody>
//       <tr>
//         <td>
//           <te-summarize row="<row data>"></te-summarize>
//         </td>
//       </tr>
//     </tbody>
//   </table>
// </te-table-tools>
//
// Available attributes:
// summBy: '@' - property to summ by
// trackBy: '@' - track items by unique id
// resultFilter: '@' - apply filter to result of summing
// summFn: '<' - function that should be used to summ items
// template: '@' - template of info box

class TableToolsCtrl {
  constructor($element, $parse, $timeout, $filter){
    this.$element = $element;
    this.$parse = $parse;
    this.$timeout = $timeout;
    this.$filter = $filter;
    this.template = 'app/layout/components/te-table-tools/te-table-tool.tmpl.html';
    this.trackBy = 'id';
    this.summBy = 'total';
    this.selectedRows = {};
    this.displayInfo = false;
    this.summ = 0;

    // make content draggable
    this.draggableOptions = {
      appendTo: 'body',
      scroll: true,
      containment: 'body'
    };
  }

  addToSumm(row){
    let key = this.$parse(this.trackBy)(row);
    this.selectedRows[key] = row;
    this.getSumm();
  }

  removeFromSumm(row){
    let key = this.$parse(this.trackBy)(row);
    delete this.selectedRows[key];
    this.getSumm();
  }

  getSumm(){
    let self = this;
    let summ = 0;

    angular.forEach(this.selectedRows, function(row, key){

      if(self.summFn) summ += (self.summFn(row) || 0);
      else {
        summ += (self.$parse(self.summBy)(row) || 0);
      }
    });

    // trick to update view
    this.$timeout(()=>{

      self.displayInfo = Object.keys(self.selectedRows).length > 0;

      if(self.resultFilter) summ = self.$filter(self.resultFilter)(summ);
      self.summ = summ;
    },0);
  }

  initControls(){
    if(this.$controls){
      this.$element.find('.te-summarize-controls').append(this.$controls);
    }
  }

  $postLink(){
    this.$element.find('table').addClass('not-selectable');

    let controls = this.$element.find('te-table-tools-controls');

    if(controls.length){
      this.$controls = controls.detach();
    }
  }
}

TableToolsCtrl.$inject = ['$element', '$parse', '$timeout', '$filter'];

angular.module('app.layout').component('teTableTools', {
  controller: TableToolsCtrl,
  controllerAs: '$teTableTools',
  transclude: true,
  bindings: {
    summBy: '@', // property to summ by
    trackBy: '@', // track items by unique id
    resultFilter: '@', // apply filter to result of summing
    summFn: '<', // function that should be used to summ items
    template: '@', // template of info box
  },
  template:`
    <ng-include
      ng-show="$teTableTools.displayInfo"
      onload="$teTableTools.initControls()"
      src="$teTableTools.template">
    </ng-include>
    <ng-transclude></ng-transclude>
  `
});
