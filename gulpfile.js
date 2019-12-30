const {src, dest, watch, series, parallel } = require('gulp');
const loadPlugins = require('gulp-load-plugins');
const $ = loadPlugins();
const pkg = require('./package.json');
const conf = pkg["gulp-config"];
const autoprefixer = require('autoprefixer');
const browserSync = require('browser-sync');
const server = browserSync.create();
const isProd = process.env.NODE_ENV === "production";

function icon() {
    return src('./favicon.png')
    // .pipe($.imageResize({
    //     width: 10,
    //     height: 10,
    //     crop: true,
    //     upscale: false
    // }))
    .pipe($.imagemin())
    .pipe($.rename({
        prefix: 'hello-'
    }))
    .pipe(dest('./dist/images/icon'));
}

function styles() {
    return src('./src/sass/main.scss')
        .pipe($.if( !isProd, $.sourcemaps.init()))
        .pipe($.sass())
        .pipe($.postcss([
            autoprefixer()
        ]))
        .pipe($.if(!isProd, $.sourcemaps.write('.')))
        .pipe(dest('./dist/css'));
}

function scripts() {
    return src('./src/js/*.js')
        .pipe($.if(!isProd, $.sourcemaps.init()))
        .pipe($.babel())
        .pipe($.if(!isProd, $.sourcemaps.write('.')))
        .pipe(dest('./dist/js'))
}

function startAppServer() {
    server.init({
        server: {
            baseDir: './dist'
        }
    })
    watch('./src/**/*.scss', styles);
    watch('./src/**/*.scss').on('change', server.reload);
}

function lint() {
    return src('./src/js/*.js')
        .pipe($.eslint({fix: true}))
        .pipe($.eslint.format())
        .pipe($.eslint.failAfterError())
        .pipe(dest('./src/js'));
}

const serve = series(parallel(styles, series(lint, scripts)), startAppServer);
exports.icon = icon;
exports.styles = styles;
exports.scripts = scripts;
exports.lint = lint;
exports.serve = serve;