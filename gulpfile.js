"use strict";

var gulp = require('gulp');
var tsproject = require( 'tsproject' );
var https = require('https');
var fs = require('fs');
var gulpRename = require('gulp-rename');
var secrets = require('./secrets.js');
var gulpDotFlatten = require('./lib/gulp-dot-flatten.js');
var gulpScreepsUpload = require('./lib/gulp-screeps-upload.js');
var tsconfigGlob = require('tsconfig-glob');
var tslint = require('gulp-tslint');
var clean = require('gulp-clean');
var merge = require('merge-stream');

gulp.task('clean', () => {
  return gulp.src('dist', { read: false })
    .pipe(clean());
});

let compileFailed = false;

gulp.task('flatten', ['checked-compile'], () => {
  var mainsrc = gulp.src('./dist/src/**/*.js')
    .pipe(gulpDotFlatten(0))
    .pipe(gulp.dest('./dist/flat'))

    var stl = gulp.src('./node_modules/typescript-stl/lib/typescript-stl.js')
                .pipe(gulp.dest('./dist/flat'))

    return merge(mainsrc, stl); 
});

gulp.task('compile', ['clean'], () => {
    return tsproject.src( './tsconfig.json')
        .on('error', (err) => { compileFailed = true; })
        .pipe(gulp.dest('./dist'));
});

gulp.task('checked-compile', ['compile'], () => {
  if (!compileFailed)
    return true;
  throw new PluginError("gulp-typescript", "failed to compile: not executing further tasks");
});

gulp.task('upload', ['flatten'], () => {
  return gulp.src('./dist/flat/*.js')
    .pipe(gulpRename(path => { path.extname = ''; }))
    .pipe(gulpScreepsUpload(secrets.email, secrets.password, 'development', 0))
});

gulp.task('upload-sim', ['flatten'], function () {
    console.log("Starting upload");
    var email = secrets.email,
        password = secrets.password,
        data = {
            branch: 'development',
            modules: { main: fs.readFileSync('./dist/main.js', { encoding: "utf8" }) }
        };
    var req = https.request({
        hostname: 'screeps.com',
        port: 443,
        path: '/api/user/code',
        method: 'POST',
        auth: email + ':' + password,
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        }
    }, function(res) {
        console.log("Response: " + res.statusCode);
    });

    req.write(JSON.stringify(data));
    req.end();
});

gulp.task('watch', function() {
    gulp.watch('./src/**/*.ts', ['build']);
});

gulp.task('build', ['upload']);

gulp.task('default',['watch']);