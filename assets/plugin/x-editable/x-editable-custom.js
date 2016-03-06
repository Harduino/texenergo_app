/**
 * Created by Egor Lobanov on 05.03.16.
 */
(function(){
    angular.module('xeditable').directive('editableSelectWithDefault', ['editableDirectiveFactory', '$timeout',
        function(editableDirectiveFactory, $timeout) {
            return editableDirectiveFactory({
                directiveName: 'editableSelectWithDefault',
                inputTpl: '<select></select>',
                render: function() {
                    var _this = this;
                    _this.parent.render.call(this);
                    _this.inputEl.addClass("editable-input form-control");
                    $timeout(function(){
                        var empty = _this.inputEl.find('option[value="?"]'),
                            empty2 = _this.inputEl.find('option:eq(0)'),
                            def = $('<option value="?">Не выбрано</option>');
                        if(empty.length == 1 || !empty2.attr('value')) {
                            empty.remove();
                            empty2.remove();
                            def.attr("selected", "selected");
                        }
                        _this.inputEl.append(def);
                    }, 0);
                },
                autosubmit: function() {
                    var self = this;
                    self.inputEl.bind('change', function() {
                        self.scope.$apply(function() {
                            self.scope.$form.$submit();
                        });
                    });
                }
            });
        }]);
}());