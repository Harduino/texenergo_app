'use strict';

var gulp = require('gulp'),
    babel = require('gulp-babel'),
    concat = require('gulp-concat'),
    connect = require('gulp-connect'),
    csso = require('gulp-csso'),
    gulpif = require('gulp-if'),
    minify = require('gulp-minify'),
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
        'assets/css/select.min.css',
        'assets/plugin/x-editable/xeditable.css',
        'assets/plugin/ion.rangeSlider/css/normalize.css',
        'assets/plugin/ion.rangeSlider/css/ion.rangeSlider.css'

    ])
    .on('error', console.log)
    .pipe(concat('app-styles.css'))
    .pipe(csso())
    .pipe(gulp.dest('public/assets/stylesheets/'));
});

var buildJs = function(destinationFileName, files, skipES6) {
    return gulp.src(files, {base: 'src'})
        .on('error', console.warn)
        .pipe( gulpif(!skipES6, babel({presets: ['es2015']})) )
        .pipe(concat(destinationFileName))
        .pipe(ngAnnotate())
        .pipe(minify())
        .pipe(gulp.dest('public/assets/javascripts/'));
};

gulp.task('libs', function(){
    buildJs('libs.js', [
        'assets/plugin/jquery/dist/jquery.min.js',
        'assets/plugin/bootstrap/dist/js/bootstrap.min.js',
        'assets/plugin/jquery-ui/jquery-ui.min.js',
        'assets/plugin/jquery-ui/datepicker-locale.js',
        'assets/plugin/d3/d3.min.js',
        'assets/plugin/angular/angular.min.js',
        'assets/plugin/i18n/*.js',
        'assets/plugin/angular-ui-router/release/angular-ui-router.min.js',
        'assets/plugin/angular-sanitize/angular-sanitize.min.js',
        'assets/plugin/angular-animate/angular-animate.min.js',
        'assets/plugin/angular-cookies/angular-cookies.min.js',
        'assets/plugin/ngstorage/ngStorage.min.js',

        //Auth0
        'assets/plugin/auth0-lock/build/lock.min.js',
        'assets/plugin/angular-lock/dist/angular-lock.min.js',
        'assets/plugin/angular-jwt/dist/angular-jwt.min.js',
        //

        'assets/plugin/angular-bootstrap/ui-bootstrap-tpls.min.js',
        'assets/plugin/angular-file-upload/dist/angular-file-upload.js',
        
        'assets/plugin/ui-select/select.min.js',
        'assets/plugin/fastclick/lib/fastclick.js',
        'assets/plugin/chartjs/chart.min.js',
        'assets/plugin/dropzone/downloads/dropzone.min.js',
        'assets/plugin/lodash/dist/lodash.min.js',
        // 'app/smartadmin-plugin/*/*.js',
        'app/smartadmin-plugin/notification/SmartNotification.min.js',
        'app/smartadmin-plugin/smartwidgets/jarvis.widget.js',
        'assets/plugin/infinite-scroll/ng-infinite-scroll.js',
        'assets/plugin/easy-pie-chart/angular.easypiechart.min.js',
        'assets/plugin/angular-ui-tinymce/src/tinymce.js',
        'assets/plugin/x-editable/xeditable.js',
        'assets/plugin/x-editable/x-editable-custom.js',
        'assets/plugin/ion.rangeSlider/js/ion.rangeSlider.min.js',


        'assets/plugin/cancan/export.js',
        'assets/plugin/cable/cable.js',
        'assets/plugin/cancan/export-angular.js'
    ], true);
});

gulp.task('app', function(){
    buildJs('app-modules.js', [
        'app/env/production.js',
        'app/layout/notifications.js',
        'app/*/module.js',
        'app/auth/directives/loginInfo.js',
        'app/*/services/*.js',
        'app/layout/templates.js',
        'app/layout/actions/*.js',
        'app/layout/filters/filters.js',
        'app/layout/service/services.js',
        'assets/widgets/directives/*.js',
        'app/*/controllers/*.js',
        'app/*/directives/*.js',
        'assets/plugin/angular-d3/angular-d3.js',
        'app/app.api.js',
        'app/app.js',
        'app/app.config.js'
    ])
        .pipe(connect.reload());
});

gulp.task('launch', function() {
    connect.server({
        root: '',
        livereload: true,
        port: 8000
    });
});

gulp.task('watch', function() {
    gulp.watch([
        'app/*/module.js',
        'app/layout/templates.js',
        'app/auth/directives/loginInfo.js',
        'app/*/services/*.js',
        'app/layout/actions/*.js',
        'app/layout/filters/filters.js',
        'app/layout/service/services.js',
        'assets/widgets/directives/*.js',
        'app/*/controllers/*.js',
        'app/*/directives/*.js',
        'app/app.api.js',
        'app/app.js',
        'app/app.config.js'
    ], function(){
        gulp.start('app');
    });
});

gulp.task('server', ['launch', 'watch']);
gulp.task('serve', ['app', 'libs', 'styles', 'server']);
gulp.task('default', ['app', 'libs', 'styles']);
