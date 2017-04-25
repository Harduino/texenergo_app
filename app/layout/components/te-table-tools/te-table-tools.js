class TableToolsCtrl {
  constructor($element, $parse, $timeout, $filter){
    this.$element = $element;
    this.$parse = $parse;
    this.$timeout = $timeout;
    this.$filter = $filter;
    this.template = 'app/layout/components/te-table-tools/te-table-tool.tmpl.js';
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

    console.info('Summ', this.selectedRows, this.trackBy, this.summBy);

    angular.forEach(this.selectedRows, function(row, key){

      console.log(row, key);

      if(self.summFn) summ += self.summFn(row);
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
}

TableToolsCtrl.$inject = ['$element', '$parse', '$timeout', '$filter'];

angular.module('app.layout').component('teTableTools', {
  controller: TableToolsCtrl,
  controllerAs: '$teTableTools',
  transclude: true,
  bindings: {
    summBy: '@',
    trackBy: '@',
    resultFilter: '@',
    summFn: '<',
    template: '@'
  },
  template:`
    <ng-include ng-if="$teTableTools.displayInfo"
      src="$teTableTools.template" te-jq-ui="$teTableTools.draggableOptions"
      data-ui-type="draggable">
    </ng-include>
    <ng-transclude></ng-transclude>
  `
});
