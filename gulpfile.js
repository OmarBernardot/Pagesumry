const { src, dest, series, parallel } = require("gulp");
const uglifyjs = require("uglify-es");
const composer = require("gulp-uglify/composer");
const pump = require("pump");
const postcss = require("gulp-postcss");
const cssnano = require("cssnano");

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
      zip("PageSumry.zip"),
      dest("."),
    ],
    cb
  );
}

// Minify CSS
function css(cb) {
  pump(
    [
      src("popup.css"),
      postcss([cssnano()]),
      zip("PageSumry.zip", { append: true }),
      dest("."),
    ],
    cb
  );
}

// Copy other necessary files including icons
function copyOther(cb) {
  pump(
    [
      src(["popup.html", "manifest.json", "icon128.png"]),
      zip("PageSumry.zip", { append: true }),
      dest(".chromestore"),
    ],
    cb
  );
}

// Default task
exports.default = series(js, css, copyOther);
