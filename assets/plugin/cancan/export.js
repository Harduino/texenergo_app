(function() {
  var slice = [].slice;

  (function(global, factory) {
    if (typeof define === 'function' && (define.amd != null)) {
      return define(['lodash'], factory);
    } else {
      return factory(global._);
    }
  })(this, function(_) {
    return this.CanCanAbility = (function() {
      var Rule;

      CanCanAbility.prototype.rules = [];

      CanCanAbility.prototype.rulesIndex = {};

      CanCanAbility.prototype.helpers = [];

      function CanCanAbility(data) {
        var i, len, name, ref, source;
        if(data){
            $.extend(this, data.ability || {});
            this[this.userProperty || 'user'] = data.user;
            ref = this.helpersSource || [];
            for (source = i = 0, len = ref.length; i < len; source = ++i) {
                name = ref[source];
                this[name] = $.proxy(eval(source), this);
            }
            this.rules = this.rules.map((function(_this) {
                return function(data) {
                    return new Rule(data, _this);
                };
            })(this));
        }
      }

      CanCanAbility.prototype.can = function() {
        var action, extra_args, match, relevant_rules, subject;
        action = arguments[0], subject = arguments[1], extra_args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
        relevant_rules = this.relevant_rules(action, subject);
        match = _(relevant_rules).find((function(_this) {
          return function(rule) {
            return rule.matches_conditions(action, subject, extra_args);
          };
        })(this));
        return match && match.baseBehavior || false;
      };

      CanCanAbility.prototype.cannot = function() {
        var action, extra_args, object;
        action = arguments[0], object = arguments[1], extra_args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
        return !this.can.apply(this, [action, object].concat(slice.call(extra_args)));
      };

      CanCanAbility.prototype.typeOf = function(subject) {
        if (typeof subject === 'string') {
          return subject;
        } else {
          return subject._type || subject.type;
        }
      };

      CanCanAbility.prototype.matches_subject = function(subjects, subject) {
        return _(subjects).include('all') || _(subjects).include(this.typeOf(subject));
      };

      CanCanAbility.prototype.relevant_rules = function(action, subject) {
        return _.clone(this.rules).reverse().filter((function(_this) {
          return function(rule) {
            return _this.matches_subject(rule.subjects, subject) && rule.is_relevant(action, subject);
          };
        })(this));
      };

      Rule = (function() {
        Rule.prototype.matchAll = false;

        Rule.prototype.baseBehavior = true;

        Rule.prototype.actions = [];

        Rule.prototype.subjects = [];

        Rule.prototype.conditions = {};

        Rule.prototype.block = null;

        function Rule(data, ability) {
          $.extend(this, data);
          this.ability = ability;
          this.block = $.proxy(eval(data.blockSource), ability);
        }

        Rule.prototype.typeOf = CanCanAbility.prototype.typeOf;

        Rule.prototype.is_relevant = function(action, subject) {
          return this.matchAll || (this.matches_action(action) && this.matches_subject(subject));
        };

        Rule.prototype.matches_action = function(action) {
          return _(this.actions).include('manage') || _(this.actions).include(action);
        };

        Rule.prototype.matches_subject = function(subject) {
          return this.ability.matches_subject(this.subjects, subject);
        };

        Rule.prototype.matches_conditions = function(action, subject, extra_args) {
          if (this.matchAll) {
            return this.call_block_with_all(action, subject, extra_args);
          } else if (this.block && typeof subject !== 'string') {
            return this.block.apply(this, [subject].concat(slice.call(extra_args)));
          } else if (this.conditions && typeof subject !== 'string') {
            return this.matches_conditions_hash(subject);
          } else {
            return !this.conditions || $.isEmptyObject(this.conditions) || this.baseBehavior;
          }
        };

        Rule.prototype.call_block_with_all = function(action, subject, extra_args) {
          if (typeof subject === 'string') {
            return this.block.apply(this, [action, subject, nil].concat(slice.call(extra_args)));
          } else {
            return this.block.apply(this, [action, this.typeOf(subject), subject].concat(slice.call(extra_args)));
          }
        };

        Rule.prototype.matches_conditions_hash = function(subject, conditions) {
          var every_match;
          if (conditions == null) {
            conditions = this.conditions;
          }
          if ($.isEmptyObject(conditions)) {
            return true;
          }
          return every_match = !_(conditions).find((function(_this) {
            return function(value, name) {
              return !_this.condition_match(subject[name], value);
            };
          })(this));
        };

        Rule.prototype.condition_match = function(attribute, value) {
          if ($.isPlainObject(value)) {
            return this.hash_condition_match(attribute, value);
          } else if ($.isArray(value)) {
            return _(value).include(attribute);
          } else {
            return attribute === value;
          }
        };

        Rule.prototype.hash_condition_match = function(attribute, value) {
          if ($.isArray(attribute)) {
            return _(attribute).find((function(_this) {
              return function(element) {
                return _this.matches_conditions_hash(element, value);
              };
            })(this));
          } else {
            return (attribute != null) && (typeof this.matches_conditions_hash === "function" ? this.matches_conditions_hash(attribute, value) : void 0);
          }
        };

        return Rule;

      })();

      return CanCanAbility;

    })();
  });

}).call(this);
