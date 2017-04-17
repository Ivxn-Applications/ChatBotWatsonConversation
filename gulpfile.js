var gulp = require('gulp'),
    watch = require('gulp-watch'),
    concat = require('gulp-concat'),
    uglify = {
      css: require('gulp-uglifycss')
    };

gulp.task('build-chat-js', function() {

  return gulp.src('./client/src/chat/js/**/*.js')
      .pipe(concat('app.js'))
      .pipe(gulp.dest('./client/build/chat/js/'));

});

gulp.task('build-chat-css', function () {

  return gulp.src('./client/src/chat/css/**/*.css')
      .pipe(concat('style.css'))
      .pipe(uglify.css())
      .pipe(gulp.dest('./client/build/chat/css/'));

});

gulp.task('build-chat-assets', ['build-chat-css'], function() {

  return gulp.src('./client/src/chat/**/*.{html,svg,ttf,eot,woff,woff2}').pipe(gulp.dest('./client/build/chat'));

});

gulp.task('build-loader', function () {

  return gulp.src('./client/src/loader/**/*.*').pipe(gulp.dest('./client/build/loader'));

});

gulp.task('build-chat', ['build-chat-assets', 'build-chat-js']);

gulp.task('build', ['build-chat', 'build-loader']);

gulp.task('watch', ['build'], function () {
  gulp.watch('./client/src/chat/**/*.*', ['build-chat']);
  gulp.watch('./client/src/loader/**/*.*', ['build-loader']);
});
