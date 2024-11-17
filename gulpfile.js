const { src, dest, series, parallel } = require("gulp");
const uglify = require("gulp-uglify");
const postcss = require("gulp-postcss");
const cssnano = require("cssnano");
const rename = require("gulp-rename");
const replace = require("gulp-replace");

// We'll use a dynamic import for gulp-zip
let zip;
import("gulp-zip").then((module) => {
  zip = module.default;
});

// Minify and obfuscate JavaScript using UglifyJS
function js() {
  return src(["popup.js", "background.js", "content.js"])
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
    .pipe(dest("dist"));
}

// Minify CSS
function css() {
  return src("styles.css")
    .pipe(postcss([cssnano()]))
    .pipe(rename({ suffix: ".min" }))
    .pipe(dest("dist"));
}

// Copy HTML and manifest
function copy() {
  return src(["popup.html", "manifest.json", "*.png"]).pipe(dest("dist"));
}

// Update references in HTML and manifest to minified files
function updateRefs() {
  return src(["dist/popup.html", "dist/manifest.json"])
    .pipe(replace("popup.js", "popup.min.js"))
    .pipe(replace("background.js", "background.min.js"))
    .pipe(replace("content.js", "content.min.js"))
    .pipe(replace("styles.css", "styles.min.css"))
    .pipe(dest("dist"));
}

// Zip the distribution folder
function zipDist() {
  return src("dist/**").pipe(zip("chrome-extension.zip")).pipe(dest("."));
}

// Default task
exports.default = series(parallel(js, css, copy), updateRefs, zipDist);
