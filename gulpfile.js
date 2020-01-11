const gulp = require('gulp');
const concat = require('gulp-concat');
const browserSync = require('browser-sync');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const cleancss = require('gulp-clean-css');
const notify = require('gulp-notify');

const gutil = require('gulp-util');
const through = require('through2');

// Для запуска конфигурации прода, необходимо добавить параметр --prod
const gulpif = require('gulp-if');
const argv = require('yargs').argv;

const scripts = require('./scripts');
const styles = require('./styles');

let templateRegular = /(templateUrl):[ ?]*['"]([\d\w/.]*)['"]/gm;

// Функция замена контента js файлов для подмены шаблона
let AngularJsTemplateReplacerFunction = function (file, enc, cb) {
    var currentPipe = this;

    // Если файл не существует
    if (file.isNull()) {
        cb(null, file);
        return;
    }

    // Если файл представлен потоком
    if (file.isStream()) {
        cb(new gutil.PluginError('AngularJsTemplateReplacerFunction', 'Streaming not supported'));
        return;
    }

    // Проверяем, что это файл из проекта
    if (file.path.indexOf('\\src\\') != -1) {

        // Так как содержимое файла в vinyl-объекте представлено буфером, то
        // перед тем, как что-то с ним делать — необходимо преобразовать его к строке
        let data = file.contents.toString();
        let matches = data.match(templateRegular);

        if (matches != null) {

            // Проходимся по всем совпадениям в файле
            for (var i = 0; i < matches.length; i++) {
                let match = templateRegular.exec(matches[i]);

                // Исходная строка с шаблоном
                let fullString = match[0];

                // Путь к файлу шаблона
                let templateFilePath = '/src/' + match[2];

                // Чтение файла html шаблона
                let fs = require('fs'),
                    path = require('path'),
                    filePath = path.join(__dirname, templateFilePath);
                fs.readFile(filePath, { encoding: 'utf-8' }, function (err, fileData) {
                    if (!err) {

                        // заменяем ссылку на шаблон на содержимое шаблона
                        data = data.replace(fullString, `template: \`${fileData}\``);
                        file.contents = Buffer.from(data);

                        // Передаём файл следующему плагину
                        currentPipe.push(file);
                    } else {
                        console.log(err);
                    }
                });
            }
        } else {
            // Передаём неизменённый файл следующему плагину
            currentPipe.push(file);
        }
    } else {
        // Передаём неизменённый файл следующему плагину
        currentPipe.push(file);
    }
    cb();
};

gulp.task('js', function (callback) {
    gulp.src(scripts)
        .pipe(through.obj(AngularJsTemplateReplacerFunction))
        .pipe(gulpif(!argv.prod, sourcemaps.init()))
        .pipe(concat('scripts.js'))
        .pipe(babel({
            presets: [
                "@babel/preset-env"
            ],
            compact: true,
            comments: false
        }))
        .pipe(gulpif(argv.prod, uglify()))
        .pipe(gulpif(!argv.prod, sourcemaps.write()))
        .pipe(gulp.dest('dist/js'))
        .pipe(browserSync.reload({
            stream: true
        }));
    callback();
});

gulp.task('html', function (callback) {
    gulp.src('./src/**/*.html')
        .pipe(gulp.dest('dist'))
        .pipe(browserSync.reload({
            stream: true
        }));
    callback();
});

gulp.task('css', function (callback) {
    gulp.src(styles)
        .pipe(gulpif(!argv.prod, sourcemaps.init()))
        .pipe(gulpif(!argv.prod, sass({ outputStyle: 'expanded' }).on("error", notify.onError())))
        .pipe(gulpif(argv.prod, sass({ outputStyle: 'compressed' }).on("error", notify.onError())))
        .pipe(concat('main.css'))
        .pipe(gulpif(argv.prod, cleancss({ level: { 1: { specialComments: 0 } } })))
        .pipe(gulpif(!argv.prod, sourcemaps.write()))
        .pipe(gulp.dest('dist/css'))
        .pipe(browserSync.reload({
            stream: true
        }));
    callback();
});

gulp.task('assets', function (callback) {
    gulp.src('./src/assets/**/*.*')
        .pipe(gulp.dest('dist/assets'))
        .pipe(browserSync.reload({
            stream: true
        }));
    callback();
});

gulp.task('build', gulp.parallel('js', 'html', 'css', 'assets'));

gulp.task('browser-sync', function (callback) {
    browserSync.init({
        open: false,
        server: {
            baseDir: 'dist'
        },
        port: 3000,
        ui: false
    });
    callback();
});

gulp.task('start', gulp.series('build', 'browser-sync', function (callback) {
    gulp.watch(['./src/styles/**/*.scss'], gulp.series('css'));
    gulp.watch(['./src/**/*.js'], gulp.series('js'));
    gulp.watch(['./src/**/*.html'], gulp.series('html', 'js'));
    gulp.watch(['./src/assets/**/*.*'], gulp.series('assets'));
    callback();
}));

gulp.task('default', gulp.parallel('start'));