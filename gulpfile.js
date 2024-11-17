const { src, dest, series, parallel } = require("gulp");
const uglifyjs = require("uglify-es");
const composer = require("gulp-uglify/composer");
const pump = require("pump");
const postcss = require("gulp-postcss");
const cssnano = require("cssnano");
const replace = require("gulp-replace");

// We'll use a dynamic import for gulp-zip
let zip;
import("gulp-zip").then((module) => {
  zip = module.default;
});

const minify = composer(uglifyjs, console);

// Minify and obfuscate JavaScript using uglify-es
function js(cb) {
  pump(
    [
      src(["popup.js", "background.js", "content.js"]),
      minify({
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
          side_effects: true,
          warnings: false,
        },
      }),
      dest("dist"),
    ],
    cb
  );
}

// Minify CSS
function css(cb) {
  pump([src("popup.css"), postcss([cssnano()]), dest("dist")], cb);
}

// Copy HTML and manifest
function copy(cb) {
  pump([src(["popup.html", "manifest.json", "icons/*.png"]), dest("dist")], cb);
}

// Update references in HTML and manifest to minified files
function updateRefs(cb) {
  pump(
    [
      src(["dist/popup.html", "dist/manifest.json"]),
      replace("popup.css", "popup.css"), // No change needed as we're keeping original filenames
      dest("dist"),
    ],
    cb
  );
}

// Zip the distribution folder
function zipDist(cb) {
  pump([src("dist/**"), zip("PageSumry.zip"), dest(".chromestore")], cb);
}

// Default task
exports.default = series(parallel(js, css, copy), updateRefs, zipDist);
