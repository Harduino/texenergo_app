var gulp = require('gulp'),
    csso = require('gulp-csso'),
    minify = require('gulp-minify'),
    concat = require('gulp-concat'),
    ngAnnotate = require('gulp-ng-annotate');

gulp.task('styles', function() {
    //css
    gulp.src([
        'assets/css/bootstrap.min.css',
        'assets/css/font-awesome.min.css',
        'assets/css/smartadmin-production-plugins.min.css',
        'assets/css/smartadmin-production.min.css',
        'assets/css/smartadmin-skins.min.css',
        'assets/css/fixes.css',
        'assets/css/smartadmin-rtl.min.css',
        'assets/css/project.css',
        'assets/css/select.min.css'
    ])
    .on('error', console.log)
    .pipe(concat('app-styles.css'))
    .pipe(csso())
    .pipe(gulp.dest('public/assets/stylesheets/'));
});
gulp.task('libs', function(){
    //js
    gulp.src([
        'assets/plugin/jquery/dist/jquery.min.js',
        'assets/plugin/bootstrap/dist/js/bootstrap.min.js',
        'assets/plugin/jquery-ui/jquery-ui.min.js',
        'assets/plugin/angular/angular.min.js',
        'assets/plugin/i18n/*.js',
        'assets/plugin/angular-ui-router/release/angular-ui-router.min.js',
        'assets/plugin/angular-sanitize/angular-sanitize.min.js',
        'assets/plugin/angular-animate/angular-animate.min.js',
        'assets/plugin/angular-bootstrap/ui-bootstrap-custom-tpls-0.14.3.min.js',
        'assets/plugin/ui-select/select.min.js',
        'assets/plugin/fastclick/lib/fastclick.js',
        'assets/plugin/chartjs/chart.min.js',
        'assets/plugin/dropzone/downloads/dropzone.min.js',
        'assets/plugin/lodash/dist/lodash.min.js',
        'app/smartadmin-plugin/*/*.js',
        'assets/plugin/infinite-scroll/ng-infinite-scroll.js',
        'assets/plugin/easy-pie-chart/angular.easypiechart.min.js',
        'assets/plugin/ui-tinymce/tinymce.js',


        'app/assets/javascripts/admin/plugin/cancan/export.js',
        'app/assets/javascripts/admin/plugin/cable/cable.js',
        'app/assets/javascripts/admin/plugin/cancan/export-angular.js'
    ])
        .on('error', console.warn)
        .pipe(concat('libs.js'))
        .pipe(ngAnnotate())
        .pipe(minify())
        .pipe(gulp.dest('public/assets/javascripts/'));
});
gulp.task('app', function(){
    gulp.src([
        'app/layout/notifications.js',
        'app/*/module.js',
        'app/auth/models/User.js',
        'app/auth/directives/loginInfo.js',
        'app/layout/templates.js',
        'app/layout/actions/*.js',
        'app/layout/filters/filters.js',
        'app/layout/service/services.js',
        'app/layout/directives/*.js',
        'widgets/directives/*.js',
        'app/*/controllers/*.js',
        'app/app.js'
    ])
        .on('error', console.warn)
        .pipe(concat('app-modules.js'))
        .pipe(ngAnnotate())
        .pipe(minify())
        .pipe(gulp.dest('public/assets/javascripts/'));
});