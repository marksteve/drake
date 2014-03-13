var coffee = require('gulp-coffee');
var component = require('gulp-component');
var gulp = require('gulp');
var minifyCSS = require('gulp-minify-css');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');


var paths = {
  js: './src/*.coffee',
  css: './src/*.scss',
};

gulp.task('js', function() {
  return gulp.src(paths.js)
    .pipe(coffee())
    .pipe(gulp.dest('./lib'));
});

gulp.task('css', function() {
  return gulp.src(paths.css)
    .pipe(sass())
    .pipe(gulp.dest('./lib'));
});

gulp.task('componentJS', ['js'], function() {
  return gulp.src('component.json')
    .pipe(component.scripts())
    .pipe(rename({basename: 'build'}))
    .pipe(gulp.dest('./build'));
});

gulp.task('componentCSS', ['css'], function() {
  return gulp.src('component.json')
    .pipe(component.styles())
    .pipe(rename({basename: 'build'}))
    .pipe(gulp.dest('./build'));
});

gulp.task('uglify', ['componentJS'], function() {
  return gulp.src('./build/build.js')
    .pipe(uglify())
    .pipe(rename({basename: 'build.min'}))
    .pipe(gulp.dest('./build'));
});

gulp.task('minifyCSS', ['componentCSS'], function() {
  return gulp.src('./build/build.css')
    .pipe(minifyCSS())
    .pipe(rename({basename: 'build.min'}))
    .pipe(gulp.dest('./build'));
});

gulp.task('watch', function() {
  gulp.watch(paths.js, ['uglify']);
  gulp.watch(paths.css, ['minifyCSS']);
});

gulp.task('default', ['uglify', 'minifyCSS', 'watch']);