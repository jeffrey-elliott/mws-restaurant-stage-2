/*jshint esversion: 6 */

var gulp = require('gulp');
var replace = require('gulp-replace');
var exec = require('child_process').exec;
var babelify = require('babelify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

/*
  https://github.com/thefinitemonkey/udacity-restaurant-reviews/blob/master/gulpfile.js
*/
gulp.task('sw', () => {
  const b = browserify({
    debug: true
  });

  return b
    .transform(babelify)
    .require('app/sw.js', { entry: true })
    .bundle()
    .pipe(source('sw.js'))
    .pipe(gulp.dest("dist/"));
});

gulp.task('test-args', function() {
  console.log(process.argv);
  console.log(process.argv[4]);
});

gulp.task('start-app', function (cb) {
  process.chdir('dist');

  exec('python -m http.server 8234', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });

	process.chdir('../');
})

gulp.task('start-service', function (cb) {
  exec('node service/server', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });

})

gulp.task('files', function() {
	gulp.src(['app/**/*', '!app/index.html', '!app/restaurant.html','!app/sw.js'])
		.pipe(gulp.dest('dist/'));
});

gulp.task('api-key', function() {

	const key = process.argv[3];

  	gulp.src(['app/index.html'])
  		.pipe(replace('<<api-key>>', key))
  		.pipe(gulp.dest('dist/'));

	gulp.src(['app/restaurant.html'])
  		.pipe(replace('<<api-key>>', key))
  		.pipe(gulp.dest('dist/'));

});

gulp.task('watch', function() {
    gulp.watch('app/**/*', ['sw','files', 'api-key' ]);
});

gulp.task('default', ['sw', 'files', 'api-key', 'watch', 'start-service', 'start-app']);