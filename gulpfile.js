'use strict';
/* пути к исходным файлам (src), к готовым файлам (build), а также к тем, за изменениями которых нужно наблюдать (watch) */
let path = {
    dist: {
        root: 'example/'
    },
    src: {
        root: 'src/'
    },
    type: {
        html: '**/[^_]*.+(html|php|tpl)',
        js: '**/[^_]*.js',
        scss: '**/[^_]*.+(sass|scss)',
        css: '**/[^_]*.css',
        img: '**/[^_]*.+(jpg|jpeg|png|svg|gif)',
        other: '**/[^_]*.!(html|php|js|sass|scss|css|jpg|jpeg|png|svg|gif|tpl)'
    },
    watch: {
        html: '**/*.+(html|php|tpl)',
        js: '**/*.js',
        css: '**/*.css',
        scss: '**/*.+(sass|scss)',
        img: '**/*.(jpg|jpeg|png|svg|gif)',
        other: '**/*.!(html|php|js|sass|scss|css|jpg|jpeg|png|svg|gif|tpl)'
    }
};

/* подключаем gulp и плагины */
const gulp = require('gulp'),  // подключаем Gulp
    plumber = require('gulp-plumber'), // модуль для отслеживания ошибок
    rigger = require('gulp-rigger'), // модуль для импорта содержимого одного файла в другой
    sourcemaps = require('gulp-sourcemaps'), // модуль для генерации карты исходных файлов
    sass = require('gulp-sass'), // модуль для компиляции SASS (SCSS) в CSS
    autoprefixer = require('gulp-autoprefixer'), // модуль для автоматической установки автопрефиксов
    cleanCSS = require('gulp-clean-css'), // плагин для минимизации CSS
    uglify = require('gulp-uglify'), // модуль для минимизации JavaScript
    cache = require('gulp-cache'), // модуль для кэширования
    rimraf = require('gulp-rimraf'), // плагин для удаления файлов и каталогов,
    babel = require('gulp-babel'), //перевод с новых стандартов js в старые для кроссбраузерности
    htmlmin = require('gulp-htmlmin'), //минификация html
    args = require('yargs').argv, //работа с аргументами
    rename = require('gulp-rename'), //переименование
    gulpif = require('gulp-if'),
    imagemin = require('gulp-imagemin'), //сжатие изображений
    imageminJpegRecompress = require('imagemin-jpeg-recompress'), //сжатие изображений
    imageminPngquant = require('imagemin-pngquant'), //сжатие изображений
    browserSync = require('browser-sync').create() //обновление браузера

/* параметры */
let key = args.key || 'root',
    isStream = (args.stream == 'false') ? false : true,
    mode = args.mode || 'development',
    isDev = mode == 'development',
    isProd = !isDev;

// сбор html
gulp.task('html:build', () => {
    return gulp.src(path.src[key] + path.type.html) // выбор всех html файлов по указанному пути
        .pipe(plumber()) // отслеживание ошибок
        .pipe(rigger()) // импорт вложений
        .pipe(gulpif(isProd, htmlmin({
            collapseWhitespace: true, // удаляем все переносы
            removeComments: true // удаляем все комментарии
        })))
        .pipe(gulp.dest(path.dist[key])) // выкладывание готовых файлов
});

// css компиляция
gulp.task('css:build', () => {
    return gulp.src(path.src[key] + path.type.css) // получим все стили css
        .pipe(plumber()) // для отслеживания ошибок
        .pipe(rename({suffix: ".min"}))
        .pipe(gulpif(isDev, sourcemaps.init())) // инициализируем sourcemap
        .pipe(autoprefixer({ //префиксы
            overrideBrowserslist: ['last 25 versions'],
            cascade: false
        }))
        .pipe(gulpif(isProd, cleanCSS())) // минимизируем CSS
        .pipe(gulpif(isDev, sourcemaps.write('./'))) // записываем sourcemap
        .pipe(gulp.dest(path.dist[key])) // выгружаем в build
});

// scss компиляция
gulp.task('scss:build', (done) => {
    return gulp.src(path.src[key] + path.type.scss) // получим все стили scss
        .pipe(plumber()) // для отслеживания ошибок
        .pipe(rename({suffix: ".min"}))
        .pipe(gulpif(isDev, sourcemaps.init())) // инициализируем sourcemap
        .pipe(sass()) // scss -> css
        .pipe(autoprefixer({ //префиксы
            overrideBrowserslist: ['last 25 versions'],
            cascade: false
        }))
        .pipe(gulpif(isProd, cleanCSS())) // минимизируем CSS
        .pipe(gulpif(isDev, sourcemaps.write('./'))) // записываем sourcemap
        .pipe(gulp.dest(path.dist[key])) // выгружаем в build
});

// сбор js
gulp.task('js:build', () => {
    return gulp.src(path.src[key] + path.type.js) // получим файлы js
        .pipe(rename({suffix: ".min"}))
        .pipe(plumber()) // для отслеживания ошибок
        .pipe(rigger()) // импортируем все указанные файлы js
        .pipe(gulpif(isDev, sourcemaps.init())) //инициализируем sourcemap
        .pipe(babel({
            "presets": [
                [
                    "@babel/preset-env",
                    {
                        "modules": false
                    }
                ]
            ]
        }))
        .pipe(gulpif(isProd, uglify())) // минимизируем js
        .pipe(gulpif(isDev, sourcemaps.write('./'))) //  записываем sourcemap
        .pipe(gulp.dest(path.dist[key])) // положим готовый файл
});

// сбор img
gulp.task('img:build', () => {
    return gulp.src(path.src[key] + path.type.img) // получим файлы img
        // .pipe(gulpif(isProd, imagemin([
        //     imagemin.gifsicle({interlaced: true}),
        //     imageminJpegRecompress({
        //         progressive: true,
        //         max: 80,
        //         min: 60
        //     }),
        //     imageminPngquant({quality: [0.6, 0.8]}),
        //     imagemin.svgo({plugins: [{removeViewBox: true}]})
        // ])))
        .pipe(gulp.dest(path.dist[key])) // положим файлы
});

// сбор остального
gulp.task('other:build', () => {
    return gulp.src(path.src[key] + path.type.other) // выбор всех html файлов по указанному пути
        .pipe(gulp.dest(path.dist[key])) // выкладывание готовых файлов
});

// удаление js
gulp.task('js:clean', () => {
    return gulp.src(path.dist[key] + path.type.js, {read: false})
        .pipe(rimraf());
});

// удаление js файла с использованием webpack
gulp.task('js-w:clean', () => {
    return gulp.src(path.dist[key] + wpDistFile, {read: false})
        .pipe(rimraf());
});

// удаление img
gulp.task('img:clean', () => {
    return gulp.src(path.dist[key] + path.type.img, {read: false})
        .pipe(rimraf());
});

// удаление html
gulp.task('html:clean', () => {
    return gulp.src(path.dist[key] + path.type.html, {read: false})
        .pipe(rimraf());
});

// удаление css
gulp.task('css:clean', () => {
    return gulp.src(path.dist[key] + path.type.css, {read: false})
        .pipe(rimraf());
});

// удаление scss
gulp.task('scss:clean', () => {
    return gulp.src(path.dist[key] + path.type.scss, {read: false})
        .pipe(rimraf());
});

// удаление стилей
gulp.task('style:clean',
    gulp.series(
        gulp.parallel(
            'css:clean',
            'scss:clean'
        )
    )
);

// удаление other
gulp.task('other:clean', () => {
    return gulp.src(path.dist[key] + path.type.other, {read: false})
        .pipe(rimraf());
});

// удаление каталога dist 
gulp.task('clean', () => {
    return gulp.src(path.dist[key] + '*', {read: false})
        .pipe(rimraf());
});

// сборка стилей
gulp.task('style:build',
    gulp.series(
        gulp.parallel(
            'css:build',
            'scss:build'
        )
    )
);

// сборка всего
gulp.task('build',
    gulp.parallel(
        'style:build',
        'js:build',
        'html:build',
        'img:build',
        'other:build'
    )
);

gulp.task('serve', async () => {
    if (!isStream)
        return;

    browserSync.init({
        server: {
            baseDir: path.dist[key]
        },
        notify: false
    });

    browserSync.watch(path.dist[key] + '**/*.*').on('change', browserSync.reload);
});

// запуск задач при изменении файлов
gulp.task('watch', gulp.parallel('serve', async => {
    gulp.watch(path.src[key] + path.watch.css, {usePolling: true}, gulp.series('css:build'));
    gulp.watch(path.src[key] + path.watch.scss, {usePolling: true}, gulp.series('scss:build'));
    gulp.watch(path.src[key] + path.watch.js, {usePolling: true}, gulp.series('js:build'));
    gulp.watch(path.src[key] + path.watch.html, {usePolling: true}, gulp.series('html:build'));
    gulp.watch(path.src[key] + path.watch.img, {usePolling: true}, gulp.series('img:build'));
    gulp.watch(path.src[key] + path.watch.other, {usePolling: true}, gulp.series('other:build'));
}));

// очистка кэша
gulp.task('cache:clean', async () => {
    await cache.clearAll();
});

gulp.task('default', gulp.series('watch'));