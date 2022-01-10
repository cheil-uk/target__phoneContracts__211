/* Gulp & Gulp dependencies */
var gulp = require('gulp')
var argv = require('yargs').argv
var clean = require('gulp-clean')
var imagemin = require('gulp-imagemin')
var sass = require('gulp-sass')
var watch = require('gulp-watch')
var sequence = require('gulp-sequence')
var babel = require('gulp-babel')
var handlebars = require('gulp-hb')
var rename = require('gulp-rename')
var autoprefixer = require('gulp-autoprefixer')
var sourcemaps = require('gulp-sourcemaps')
var source = require('vinyl-source-stream')
var buffer = require('vinyl-buffer')
var browserify = require('browserify')
var watchify = require('watchify')
var babel = require('babelify')
var through = require('through2')
var gitConfig = require('git-config')
var replace = require('gulp-replace')

/* Other dependencies */
var chalk = require('chalk')
var path = require('path')
var fs = require('fs')

var gitConfigFile = gitConfig.sync()

/* Pretty logs */
var log = function (message, type) {
	return (type === 'error') ? console.log(chalk.red(message)) : console.log(chalk.green(message))
}

/* Project name & output directory */
var PROJECT_NAME = 'target-boilerplate';

/* Some globals to help us */
var SITE = (argv.site != '' && typeof (argv.site) != "undefined" ? argv.site : "uk")
var SUBFOLDER = (argv.subfolder != '' && typeof (argv.subfolder) != "undefined" ? PROJECT_NAME + "/" + argv.subfolder : PROJECT_NAME)

/* Configuration */
var config = {

	/* Root directory */
	ROOT_FOLDER: __dirname,

	/* Build output */
	BUILD_FOLDER: path.join(__dirname, '/build/', SITE, SUBFOLDER),

	/* Content dam assets*/
	ASSETS_FOLDER: path.join(__dirname, '/src/assets/'),

	/* Development source files */
	SRC_FOLDER: path.join(__dirname, 'src'),
}

/* Gulp delete build folder */
gulp.task('delete-build', function () {

	return gulp.src(config.BUILD_FOLDER, { read: false })
		.pipe(clean())
		.on('end', function () {
			log("Cleaned build directory")
		})
})


/* Gulp compile SCSS as compress/minified */
gulp.task('scss', function () {

	return gulp.src(config.SRC_FOLDER + '/css/**/*.scss')
		.pipe(sourcemaps.init())
		.pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: false
		}))
		// .pipe(sourcemaps.write())
		.pipe(gulp.dest(config.BUILD_FOLDER + '/css/'))
		.on('end', function () {
			log('SCSS Compiled')
		})
})

/* JavaScript - Babel / Browserify */
function compileJS(watch) {

	// Read from file and minifying 
	var minifiedCSS = fs.readFileSync(config.BUILD_FOLDER + '/css/style.css', "utf8");
	minifiedCSS = minifiedCSS.replace(/(\r\n|\n|\r)/gm, "").replace(/'/g, '"').replace(/"/g, '\\"');

	var mainJS = fs.readFileSync(config.SRC_FOLDER + "/js/main.js", "utf8");

	var bundler = watchify(
		browserify(config.SRC_FOLDER + '/js/main.js', { debug: true }).transform(babel.configure({ presets: ['es2015-ie'], plugins: ['transform-html-import-to-string'] }))
	).transform('uglifyify', { global: true })


	function rebundle() {

		// log(toolTemplate);

		bundler.bundle()
			.on('error', function (err) { console.error(err); this.emit('end'); })
			.pipe(source('main.js'))
			.pipe(replace('[[CSS]]', minifiedCSS))
			.pipe(buffer())
			.pipe(sourcemaps.init({ loadMaps: true }))
			.pipe(sourcemaps.write('./'))
			.pipe(gulp.dest(config.BUILD_FOLDER + '/js/'))
	}

	if (watch) {
		bundler.on('update', function () {
			log('Rebundling JavaScript')
			rebundle()
		})
	}

	rebundle()
}

function watchJS() {
	return compileJS(true)
}

gulp.task('buildJS', function () { return compileJS() })
gulp.task('watchJS', function () { return watchJS() })



/* Watch /src directory for changes & reload gulp */
gulp.task('watch', function () {
	gulp.watch(config.SRC_FOLDER + '/css/**/*.scss', ['scss'])
	gulp.watch(config.SRC_FOLDER + '/js/**/*.js', ['watchJS'])

	log('Watching src for changes... ')

})


gulp.task('style', sequence('scss'))
gulp.task('build', sequence('delete-build', 'scss', 'buildJS', 'watchJS'))
gulp.task('dev', sequence('delete-build', 'scss', 'buildJS'))

gulp.task('default', ['watch', 'dev', 'watchJS'])
