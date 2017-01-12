'use strict';

var gulp = require('gulp'),
    babel = require('gulp-babel'),
    concat = require('gulp-concat'),
    connect = require('gulp-connect'),
    csso = require('gulp-csso'),
    expect = require('gulp-expect-file'),
    gulpif = require('gulp-if'),
    minify = require('gulp-minify'),
    ngAnnotate = require('gulp-ng-annotate');

gulp.task('styles', function() {
    var files = [
        // 'assets/css/bootstrap.css',
        'bower_components/bootstrap/dist/css/bootstrap.css',
        'assets/css/font-awesome.css',
        'assets/css/smartadmin-production-plugins.css',
        'assets/css/smartadmin-production.css',
        'assets/css/smartadmin-skins.css',
        'assets/css/fixes.css',
        // 'assets/css/smartadmin-rtl.css',
        'assets/css/project.css',
        'assets/css/select.min.css',
        'assets/plugin/x-editable/xeditable.css',
        'bower_components/ion.rangeSlider/css/normalize.css',
        'bower_components/ion.rangeSlider/css/ion.rangeSlider.css'

    ];

    gulp.src(files)
        .pipe(expect(files))
        .on('error', console.log)
        .pipe(concat('app-styles.css'))
        .pipe(csso())
        .pipe(gulp.dest('public/assets/stylesheets/'));
});

var buildJs = function(destinationFileName, files, skipES6) {
    return gulp.src(files, {base: 'src'})
        .pipe(expect(files))
        .on('error', console.warn)
        .pipe( gulpif(!skipES6, babel({presets: ['es2015']})) )
        .pipe(concat(destinationFileName))
        .pipe(ngAnnotate())
        .pipe(minify())
        .pipe(gulp.dest('public/assets/javascripts/'));
};

gulp.task('libs', function(){
    buildJs('libs.js', [
        'bower_components/jquery/dist/jquery.min.js',
        'bower_components/bootstrap/dist/js/bootstrap.min.js',
        'bower_components/jquery-ui/jquery-ui.min.js',
        'assets/js/datepicker-locale.js',
        'bower_components/d3/d3.min.js',
        'bower_components/angular/angular.min.js',
        'assets/plugin/i18n/*.js',
        'bower_components/angular-ui-router/release/angular-ui-router.min.js',
        'bower_components/angular-sanitize/angular-sanitize.min.js',
        'bower_components/angular-animate/angular-animate.min.js',
        'bower_components/angular-cookies/angular-cookies.min.js',
        'bower_components/ngstorage/ngStorage.min.js',

        //Auth0
        'bower_components/auth0-lock/build/lock.min.js',
        'bower_components/angular-lock/dist/angular-lock.min.js',
        'bower_components/auth0-lock-passwordless/build/lock-passwordless.min.js',
        'bower_components/angular-lock-passwordless/dist/angular-lock-passwordless.min.js',
        'bower_components/angular-jwt/dist/angular-jwt.min.js',

        'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
        'bower_components/angular-file-upload/dist/angular-file-upload.js',
        
        'assets/plugin/ui-select/select.min.js',
        'bower_components/fastclick/lib/fastclick.js',
        'assets/plugin/chartjs/chart.min.js',
        'assets/plugin/dropzone/downloads/dropzone.min.js',
        'bower_components/lodash/dist/lodash.min.js',
        'app/smartadmin-plugin/notification/SmartNotification.min.js',
        'app/smartadmin-plugin/smartwidgets/jarvis.widget.js',
        'assets/plugin/infinite-scroll/ng-infinite-scroll.js',
        'assets/plugin/easy-pie-chart/angular.easypiechart.min.js',
        'assets/plugin/x-editable/xeditable.js',
        'assets/plugin/x-editable/x-editable-custom.js',
        'bower_components/ion.rangeSlider/js/ion.rangeSlider.min.js',

        // Consider remove both cancan below
        'assets/plugin/cancan/export.js',
        'assets/plugin/cable/cable.js',
        'assets/plugin/cancan/export-angular.js',

        //TinyMCE
        'bower_components/tinymce/tinymce.min.js',
        'bower_components/tinymce/plugins/*/plugin.js',
        'bower_components/tinymce/themes/modern/theme.js',
        'bower_components/angular-ui-tinymce/src/tinymce.js'
    ], true);

    gulp.src(['bower_components/tinymce-dist/skins/**'])
        .on('error', console.warn)
        .pipe(gulp.dest('public/assets/javascripts/skins/'));
});

gulp.task('app', function(){
    buildJs('app-modules.js', [
        'app/env/production.js',
        'app/layout/notifications.js',
        'app/*/module.js',
        'app/*/services/*.js',
        'app/layout/templates.js',
        'app/layout/actions/*.js',
        'app/layout/filters/filters.js',
        'assets/widgets/directives/*.js',
        'app/*/controllers/*.js',
        'app/*/components/*/*.js',
        'app/*/directives/*.js',
        'app/components/shortcut/shortcut-directive.js',
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
        'app/auth/components/login-info/login-info.js',
        'app/*/services/*.js',
        'app/layout/actions/*.js',
        'app/layout/filters/filters.js',
        'assets/widgets/directives/*.js',
        'app/*/controllers/*.js',
        'app/*/components/*/*.js',
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
