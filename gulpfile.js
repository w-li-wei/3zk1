var gulp = require("gulp")
var sass = require("gulp-sass"); //把sass文件编译
var autoprefixer = require("gulp-autoprefixer"); //自动添加浏览器前缀
var mincss = require("gulp-clean-css"); //压缩css
var concat = require("gulp-concat"); //文件合并
var minjs = require("gulp-uglify"); //压缩js
var minhtml = require("gulp-htmlmin"); //压缩html
var clean = require("gulp-clean"); //删除文件
var sequence = require("gulp-sequence"); //设置gulp任务的执行顺序
var webserver = require("gulp-webserver") //起服务
var rev = require("gulp-rev"); //文件名后缀添加MD5后缀
var revCollector = require("gulp-rev-collector"); //替换路径
var list = require("./src/data/data.json")
    //每次运行前自动删除
gulp.task("clean", function() {
        return gulp.src("build")
            .pipe(clean())
    })
    //压缩css
gulp.task("mincss", function() {
    return gulp.src("src/css/*.scss")
        .pipe(sass())
        .pipe(autoprefixer({
            browsers: ["last 2 versions", "Android>=4.0"]
        }))
        .pipe(mincss())
        .pipe(concat("all.min.css"))
        .pipe(rev()) //生成一个MD5加密的后缀名
        .pipe(gulp.dest("build/css"))
        .pipe(rev.manifest())
        .pipe(gulp.dest("rev/css"))
});
gulp.task("copycss", function() {
        return gulp.src("src/css/*.css")
            .pipe(gulp.dest("build/css"))
    })
    //压缩js
gulp.task("minjs", function() {
    return gulp.src("src/js/*.js")
        .pipe(minjs())
        .pipe(gulp.dest("build/js"))
});
//压缩html
var options = {
    removeComments: true, //清除注释
    collapseWhitespace: true //压缩html
}
gulp.task("minhtml", function() {
    return gulp.src(['rev/css/*.json', "src/*.html"])
        .pipe(revCollector({
            replaceReved: true
        }))
        .pipe(minhtml(options))
        .pipe(gulp.dest("build"))

});
//监听css，js，html发生变化
gulp.task("watch", function() {
    return gulp.watch("src/css/*.scss", ["mincss", "minhtml"])
    gulp.watch("src/*.html", ["minhtml"])
    gulp.watch("src/*.js", ["minjs"])
});
//拷贝jquery，js
gulp.task("copy", function() {
    return gulp.src("src/js/**/*.min.js")
        .pipe(gulp.dest("build/js"))
});

gulp.task("copyImg", function() {
    return gulp.src("src/img/**/*{png,jpg}")
        .pipe(gulp.dest("build/imgs"))
});


//起服务
gulp.task("server", function() {
    gulp.src("build")
        .pipe(webserver({
            port: 9090,
            open: true,
            livereload: true,
            host: "169.254.114.0",
            middleware: function(req, res, next) {
                if (req.url === '/favicon.ico') {
                    return
                }
                if (req.url === "/api/list") {
                    res.end(JSON.stringify(list))
                }
                next()
            }
        }))
});
//默认自动执行
gulp.task("default", function(cb) {
    sequence("clean", ["mincss", "minjs", "minhtml", "copy", "copyImg", "copycss"], "watch", "server", cb)
});