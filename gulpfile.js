const uglifyjs = require("uglify-es");
const gulp = require("gulp");
const composer = require("gulp-uglify/composer");
const pump = require("pump");
const zip = require("gulp-zip");

const minify = composer(uglifyjs, console);

gulp.task("compress", function (cb) {
  const options = {
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
  };

  // Minify main JavaScript files
  pump([
    gulp.src(["popup.js", "background.js", "content.js"]),
    minify(options),
    gulp.dest("dist"),
  ]);

  // Copy and minify CSS
  pump([gulp.src("popup.css"), require("gulp-clean-css")(), gulp.dest("dist")]);

  // Copy HTML and manifest
  gulp.src(["popup.html", "manifest.json"]).pipe(gulp.dest("dist"));

  // Copy icons
  gulp.src("*.png").pipe(gulp.dest("dist"));

  cb();
});

gulp.task("zip", () =>
  gulp
    .src([
      "dist/**",
      "!*.zip",
      "!node_modules/**",
      "!node_modules/",
      "!gulpfile.js",
      "!package-lock.json",
    ])
    .pipe(zip("PageSumry.zip"))
    .pipe(gulp.dest("."))
);

gulp.task("default", gulp.series("compress", "zip"));
