/*global module:false*/
module.exports = function (grunt) {
    "use strict";
    // Project configuration.
    grunt.loadNpmTasks('grunt-lmd');
    grunt.initConfig({
        lint: {
            files: [
                'grunt.js',
                'app.nw/js/main.js',
                'app.nw/js/collections/*.js',
                'app.nw/js/models/*.js',
                'app.nw/js/views/*.js'
            ]
        },
        concat: {
            css: {
                src: ['app.nw/css/*.css'],
                dest: 'app.nw/index.css'
            }
        },
        watch: {
            files: [
                '<config:lint.files>',
                '<config:concat.css.src>',
                'app.nw/js/templates/*.html'
            ],
            tasks: 'default'
        },
        lmd: {
            "app.nw": {
                projectRoot: 'app.nw/',
                build: 'index'
            }
        },
        jshint: {
            options: {
                curly:true,
                eqeqeq:true,
                immed:true,
                latedef:true,
                newcap:true,
                noarg:true,
                sub:true,
                undef:true,
                boss:true,
                eqnull:true,
                browser:true,
                node:true
            },
            globals: {
                jQuery: true
            }
        },
        uglify: {}
    });

    // Default task.
    grunt.registerTask('default', 'lint lmd concat');
};
