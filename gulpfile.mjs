import gulp from "gulp";
import { deleteAsync } from "del";
import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Clean dist folder
export const clean = () => deleteAsync(["dist"]);

// Build React app
export const buildReact = (cb) => {
  exec("npm run build", (err, stdout, stderr) => {
    console.log(stdout);
    console.error(stderr);
    cb(err);
  });
};

// Copy necessary files
export const copy = () => {
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
};

// Zip the dist folder
export const zipTask = async () => {
  const { default: gulpZip } = await import("gulp-zip");
  return gulp
    .src("dist/**")
    .pipe(gulpZip("extension.zip"))
    .pipe(gulp.dest("./"));
};

// Default task
export const defaultTask = gulp.series(clean, buildReact, copy, zipTask);

export default defaultTask;
