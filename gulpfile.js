const gulp = require("gulp");
const uglify = require("gulp-uglify");
const postcss = require("gulp-postcss");
const cssnano = require("cssnano");
const zip = require("gulp-zip");
const rename = require("gulp-rename");
const replace = require("gulp-replace");

// Minify and obfuscate JavaScript using UglifyJS
gulp.task("js", () => {
  return gulp
    .src(["popup.js", "background.js", "content.js"])
    .pipe(
      uglify({
        mangle: true,
        compress: {
          dead_code: true,
          drop_debugger: true,
          conditionals: true,
          evaluate: true,
          booleans: true,
          loops: true,
          unused: true,
          hoist_funs: true,
          keep_fargs: false,
          hoist_vars: true,
          if_return: true,
          join_vars: true,
          cascade: true,
          side_effects: true,
          warnings: false,
        },
      })
    )
    .pipe(rename({ suffix: ".min" }))
    .pipe(gulp.dest("dist"));
});

// Minify CSS
gulp.task("css", () => {
  return gulp
    .src("styles.css")
    .pipe(postcss([cssnano()]))
    .pipe(rename({ suffix: ".min" }))
    .pipe(gulp.dest("dist"));
});

// Copy HTML and manifest
gulp.task("copy", () => {
  return gulp
    .src(["popup.html", "manifest.json", "*.png"])
    .pipe(gulp.dest("dist"));
});

// Update references in HTML and manifest to minified files
gulp.task("update-refs", () => {
  return gulp
    .src(["dist/popup.html", "dist/manifest.json"])
    .pipe(replace("popup.js", "popup.min.js"))
    .pipe(replace("background.js", "background.min.js"))
    .pipe(replace("content.js", "content.min.js"))
    .pipe(replace("styles.css", "styles.min.css"))
    .pipe(gulp.dest("dist"));
});

// Zip the distribution folder
gulp.task("zip", () => {
  return gulp
    .src("dist/**")
    .pipe(zip("chrome-extension.zip"))
    .pipe(gulp.dest("."));
});

// Default task
gulp.task("default", gulp.series("js", "css", "copy", "update-refs", "zip"));
