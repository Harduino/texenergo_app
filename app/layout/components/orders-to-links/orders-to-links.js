/**
* @description Add navigation functionality to link element and
* displays popover with info about order.
*/
class OrderLink {

  constructor(element, config, $state) {
    this.element = element;
    this.config = config;

    let self = this,
        order;

    self.buildPopover();

    config.promise.then((result) => {

      order = result.data[0];
      self.buildPopover(order, config.contentFormatter);
    });

    this.element.on('click', () => {
      $state.go(self.config.state, {id: order.id});
    });
  }

  buildPopover(order, contentFormatter) {
    // clear popover before init
    this.element.popover('destroy');

    this.element.popover({
      trigger: 'hover',
      html: true,
      content: order ? contentFormatter(order) : `<div style="text-align="center">Загружаем данные</div>`
    });
  }

  destroy() {
    this.config = null;
    this.element.off('click');
    this.element.popover('destroy');
  }
}

/**
* @description Using patterns to replace orders numbers by links
*/
class OrdersToLinks {

  constructor($element, serverApi, $state) {

    this.element = $element;
    this.$state = $state;
    this.links = []; // OrderLinks instances
    this.orders = {};
    this.defExpressions = {
      CustomerOrders: {
        expr: /\s1[6789]-[а-я]{3,4}-\d+[\s,]/g,
        apiMethod: serverApi.getCustomerOrders,
        state: 'app.customer_orders.view'
      },
      DispatchOrder: {
        expr: /\sр-1[6789]-[а-я]{3,4}-\d+[\s,]/g,
        apiMethod: serverApi.getDispatchOrders,
        state: 'app.dispatch_orders.view'
      }
    };
  }

  /**
  * @description searching for orders in text and replacing to links
  */
  replaceOrders() {
    let self = this;
    let html = this.text;

    this.orders = {}

    for (let exprName in this.defExpressions){
      html = html.replace(this.defExpressions[exprName].expr, (match) => {

        let number = match.replace(/[\s,]/g, '');

        // create object for unique order
        if (!self.orders[number]) {
          self.orders[number] = {
            exprName
          };
        }

        return `<a class="link-to-order" number="${number}">${match}</a>`;
      });
    }

    this.element.html(html);
    this.initLinks();
  }

  initLinks() {
    let elements = this.element.find('.link-to-order'); // find all links to order

    this.links = [];
    this.fetchDataForOrders();

    for (let element of elements){

      let elem = angular.element(element),
          order = this.orders[elem.attr('number')];

      // create new link instance with parameters
      this.links.push(
        new OrderLink(elem, {
          promise: order.promise,
          state: this.defExpressions[order.exprName].state,
          contentFormatter: this.linkFormatter
        }, this.$state)
      );
    }
  }


  /**
  * @description Fetch data for all found orders and set result promise to order.
  */
  fetchDataForOrders() {

    for (let number in this.orders){
      let order = this.orders[number];

      order.promise = this.defExpressions[order.exprName]
      .apiMethod(1, number, {});
    }
  }

  // listening for changes and updating values
  $onChanges(changes) {
    let text = changes.text,
        expressions = changes.expressions;

    if(expressions && expressions.currentValue){
      angular.merge(this.defExpressions, expressions.currentValue);
    }

    if(text && text.currentValue) {
      this.destroyLinks();
      this.replaceOrders();
    }
  }

  /**
  * @description Destroy all OrderLinks
  */
  destroyLinks() {
    for (let link of this.links){
      link.destroy();
    }

    this.links = null;
    // also destroy orders
    this.orders = null;
  }

  // clear resources
  $onDestroy() {
    this.destroyLinks();
  }
}

OrdersToLinks.$inject = [
  '$element',
  'serverApi',
  '$state'
];

angular.module('app.layout')
.component('ordersToLinks', {
  bindings: {
    expressions: '<',
    linkFormatter: '<',
    text: '<'
  },
  controller: OrdersToLinks,
  controllerAs: '$otl',
  template: ''
});
