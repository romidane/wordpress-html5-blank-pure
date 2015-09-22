
'use strict';

// Include Gulp & tools we'll use
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var pagespeed = require('psi');
var reload = browserSync.reload;
var bsConfig = require('./bs-config');
var config = require('./config.json');

var uglifySrc = [
    /** Modernizr */
    "src/assets/bower_components/modernizr/modernizr.js",
    /** Conditionizr */
    "src/assets/bower_components/conditionizr/src/conditionizr.js",
    /** jQuery */
    "src/assets/bower_components/jquery/dist/jquery.js",
    /** owl.carousel  */
    "src/assets/bower_components/owl.carousel/dist/owl.carousel.js",
    /** Page scripts */
    "src/assets/scripts/*.js"
];

var cssminSrc = [
  'src/assets/bower_components/normalize.css/normalize.css',
  "src/assets/bower_components/pure/pure.css",
  "src/assets/bower_components/pure/grids-responsive.css",
  "src/assets/bower_components/owl.carousel/dist/assets/owl.carousel.css",
  'src/assets/styles/main.scss',
  'src/assets/styles/**/*.css'
];


var AUTOPREFIXER_BROWSERS = [
  'ie >= 8',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 5',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];

// Lint JavaScript
gulp.task('jshint', function () {
  return gulp.src(['src/assets/scripts/**/*.js','src/scripts/{!(lib)/*.js,*.js}'])
    .pipe(reload({stream: true, once: true}))
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.if(!browserSync.active, $.jshint.reporter('fail')));
});


/** Uglify */
gulp.task( "uglify", function() {
	return gulp.src( uglifySrc )
		.pipe( $.concat( "scripts.min.js" ) )
		.pipe( $.uglify() )
		.pipe( gulp.dest( "dist/assets/scripts" ) );
});

// Optimize images
gulp.task('images', function () {
  return gulp.src('src/assets/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/assets/images'))
    .pipe($.size({title: 'images'}));
});

// Copy all files at the root level (app)
gulp.task('copy', function () {
  return gulp.src([
    'src/**',
    '!src/assets/**',
    '!src/**/*.DS_Store',
    '!src/.git/**'
    ], {
    dot: true
  }).pipe(gulp.dest('dist'))
    .pipe($.size({title: 'copy'}));
});

// Copy web fonts to dist
gulp.task('fonts', function () {
  return gulp.src(['src/assets/fonts/**'])
    .pipe(gulp.dest('dist/assets/fonts'))
    .pipe($.size({title: 'fonts'}));
});

// Compile and automatically prefix stylesheets
gulp.task('styles', function () {
  // For best performance, don't add Sass partials to `gulp.src`
  return gulp.src(cssminSrc)
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      precision: 10,
      onError: console.error.bind(console, 'Sass error:')
    }))
    .pipe($.autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
    .pipe($.sourcemaps.write())
    .pipe( $.concat( "main.min.css" ) )
    // Minify styles
    .pipe($.if('*.css', $.csso()))
    .pipe(gulp.dest('dist/assets/styles'))
    .pipe($.size({title: 'styles'}));
});

gulp.task('styles:dev', function () {
  // For best performance, don't add Sass partials to `gulp.src`
  return gulp.src(cssminSrc)
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      precision: 10,
      onError: console.error.bind(console, 'Sass error:')
    }))
    .pipe($.autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
    .pipe($.sourcemaps.write())
    .pipe( $.concat( "main.min.css" ) )
    // Minify styles
    .pipe(gulp.dest('dist/assets/styles'))
    .pipe($.size({title: 'styles'}));
});

// Clean output directory
gulp.task('clean', del.bind(null, ['dist/*'], {dot: true}));

// Watch files for changes & reload
gulp.task('serve', ['default'], function () {
	browserSync(bsConfig);
  gulp.watch(['src/**/*.php'], ['copy', reload]);
  gulp.watch(['src/assets/styles/**/*.{scss,css}'], ['styles:dev', reload]);
  gulp.watch(['src/assets/scripts/**/*.js'], ['jshint','copy', reload]);
  gulp.watch(['src/assets/images/**/*'], ['images', reload]);
});


// Build production files, the default task
gulp.task('default', ['clean'], function (cb) {
  runSequence('styles', ['jshint', 'uglify', 'styles', 'images', 'fonts', 'copy'], cb);
});


// Run PageSpeed Insights
gulp.task('pagespeed', function (cb) {
  // Update the below URL to the public URL of your site
  pagespeed.output(config.siteUrl, {
    strategy: 'mobile',
    // By default we use the PageSpeed Insights free (no API key) tier.
    // Use a Google Developer API key if you have one: http://goo.gl/RkN0vE
    // key: 'YOUR_API_KEY'
  }, cb);
});

// Load custom tasks from the `tasks` directory
// try { require('require-dir')('tasks'); } catch (err) { console.error(err); }
