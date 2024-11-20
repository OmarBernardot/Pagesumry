const gulp = require("gulp");
const zip = require("gulp-zip");
const del = require("del");
const { exec } = require("child_process");

// Clean dist folder
gulp.task("clean", () => del(["dist"]));

// Build React app
gulp.task("build-react", (cb) => {
  exec("npm run build", (err, stdout, stderr) => {
    console.log(stdout);
    console.error(stderr);
    cb(err);
  });
});

// Copy necessary files
gulp.task("copy", () => {
  return gulp
    .src(
      [
        "public/manifest.json",
        "public/background.js",
        "public/content.js",
        "public/icon16.png",
        "public/icon48.png",
        "public/icon128.png",
      ],
      { base: "public" }
    )
    .pipe(gulp.dest("dist"));
});

// Zip the dist folder
gulp.task("zip", () => {
  return gulp.src("dist/**").pipe(zip("extension.zip")).pipe(gulp.dest("./"));
});

// Default task
gulp.task("default", gulp.series("clean", "build-react", "copy", "zip"));
