const gulp = require("gulp");
const uglify = require("gulp-uglify-es").default;
const obfuscate = require("gulp-javascript-obfuscator");
const zip = require("gulp-zip");
const pump = require("pump");

// Process JS files
gulp.task("process-js", (cb) => {
  pump(
    [
      gulp.src(["background.js", "popup.js"]),
      obfuscate({
        compact: true,
        controlFlowFlattening: true,
        deadCodeInjection: true,
        debugProtection: true,
        debugProtectionInterval: true,
        disableConsoleOutput: true,
        identifierNamesGenerator: "hexadecimal",
        renameGlobals: false,
        rotateStringArray: true,
        selfDefending: true,
        stringArray: true,
        stringArrayEncoding: "base64",
        stringArrayThreshold: 0.75,
        unicodeEscapeSequence: false,
      }),
      uglify(),
      gulp.dest("dist"),
    ],
    cb
  );
});

// Copy other necessary files
gulp.task("copy-files", () => {
  return gulp
    .src(["popup.html", "popup.css", "manifest.json"], { base: "." })
    .pipe(gulp.dest("dist"));
});

// Zip the dist folder
gulp.task("zip", () => {
  return gulp.src("dist/**").pipe(zip("extension.zip")).pipe(gulp.dest("."));
});

// Build task
gulp.task("build", gulp.series("process-js", "copy-files", "zip"));
