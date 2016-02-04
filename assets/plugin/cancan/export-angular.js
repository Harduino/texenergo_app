(function() {
  var slice = [].slice;

  (function(global, factory) {
    if (typeof define === 'function' && (define.amd != null)) {
      return define(['angular', 'cancan-export'], factory);
    } else {
      return factory(global.angular, global.CanCanAbility);
    }
  })(this, function(angular, CanCanAbility) {
    return angular.module('cancan.export', []).service('CanCan', function() {
      return {
        ability: new CanCanAbility(window.gon),
        getAbility: function(object) {
          return this.ability = new CanCanAbility(object);
        },
        can: function() {
          var action, argsForBlock, ref, subject;
          action = arguments[0], subject = arguments[1], argsForBlock = 3 <= arguments.length ? slice.call(arguments, 2) : [];
          return (ref = this.ability).can.apply(ref, [action, subject].concat(slice.call(argsForBlock)));
        },
        cannot: function() {
          var action, argsForBlock, ref, subject;
          action = arguments[0], subject = arguments[1], argsForBlock = 3 <= arguments.length ? slice.call(arguments, 2) : [];
          return (ref = this.ability).cannot.apply(ref, [action, subject].concat(slice.call(argsForBlock)));
        }
      };
    });
  });

}).call(this);
