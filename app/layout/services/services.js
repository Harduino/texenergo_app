/**
 * Created by Egor Lobanov on 05.12.15.
 */
(function(){

    var module = angular.module('app.layout');

    module.service('funcFactory', function(){
       this.showNotification = function(title, content, success){
           var c = !success && typeof content === 'object' ? Object.keys(content).map(function(item){
               return item + ' ' + content[item];
           }).join('\n') : content;
           $.smallBox({
               title: title,
               iconSmall: "fa fa-check fa-2x fadeInRight animated",
               content: '<i class="fa fa-edit"></i> <i>' + c + '</i>',
               color: success ? '#739E73' : '#C46A69',
               timeout: 4000
           })
       };

       this.setPageTitle = function(title){
           angular.element('html head title').text(title);
       };

       this.getPercent = function(value, total){
           return ((value/total*100) || 0).toFixed(0);
       };

       this.getTinymceOptions = function(){
           return {
               plugins : 'advlist autolink link image lists charmap preview textcolor colorpicker code',
               toolbar1: 'insertfile undo redo | preview code | styleselect | bold italic | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image',
               language_url: 'assets/js/langs/ru.js',
               menubar:false
           };
       };
    });
}());
