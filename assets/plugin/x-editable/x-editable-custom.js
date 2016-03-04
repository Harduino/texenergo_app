/**
 * Created by egorlobanov on 05.03.16.
 */
(function(){
    angular.module('xeditable').directive('editableCustom', ['editableDirectiveFactory',
        function(editableDirectiveFactory) {
            return editableDirectiveFactory({
                directiveName: 'editableCustom',
                inputTpl: '<select></select>',
                render: function() {
                    this.parent.render.call(this);
                    console.log(this);
                    //this.inputEl.after('<output>{{$data}}</output>');
                }
            });
        }]);
}());