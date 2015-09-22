module.exports = function(grunt) {

  grunt.file.defaultEncoding = 'utf-8';
  grunt.file.preserveBOM = true;

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    banner: '/**\n* Soho XI Controls v<%= pkg.version %> \n* Date: <%= grunt.template.today("dd/mm/yyyy h:MM:ss TT") %> \n* Revision: <%= meta.revision %> \n */ \n',
    amdHeader: '(function(factory) {\n\n  if (typeof define === \'function\' && define.amd) {\n    // AMD. Register as an anonymous module\n    define([\'jquery\'], factory);\n  } else if (typeof exports === \'object\') {\n    // Node/CommonJS\n    module.exports = factory(require(\'jquery\'));\n} else {\n    // Browser globals \n    factory(jQuery);\n  }\n\n}(function($) {\n\n',

    sass: {
      options: {
        sourceMap: true
      },
      dist: {
        files: {
          'public/stylesheets/demo.css'       : 'sass/demo.scss',
          'public/stylesheets/grey-theme.css' : 'sass/grey-theme.scss',
          'public/stylesheets/dark-theme.css' : 'sass/dark-theme.scss',
          'public/stylesheets/high-contrast-theme.css'  : 'sass/high-contrast-theme.scss',
          'public/stylesheets/css-only.css'   : 'sass/css-only.scss',
          'public/stylesheets/site.css'       : 'sass/site.scss'
        }
      }
    },

    watch: {
      source: {
        files: ['sass/**/*.scss', 'views/docs/**.html', 'views/**.html', 'views/includes/**.html', 'views/controls/**.html', 'js/*/*.js', 'js/*.js', 'js/cultures/*.*'],
        tasks: ['sohoxi-watch'],
        options: {
          livereload: true
        }
      }
    },

    jshint: {
      files: ['gruntfile.js', 'app.js', 'js/*.js', 'src/*/*.js'],
      options: {
        jshintrc: '.jshintrc',
      }
    },

    concat: {
      options: {
        separator: '',
        banner: '<%= banner %>'+'<%= amdHeader %>',
        footer: '\n}));\n//# sourceURL=<%= pkg.name %>.js'
      },
      basic: {
        files: {
          'dist/js/<%= pkg.name %>.js': [
            'temp/amd/utils.js',
            'temp/amd/animations.js',
            'temp/amd/locale.js',
            'temp/amd/about.js',
            'temp/amd/accordion.js',
            'temp/amd/applicationmenu.js',
            'temp/amd/autocomplete.js',
            'temp/amd/busyindicator.js',
            'temp/amd/button.js',
            'temp/amd/chart.js',
            'temp/amd/colorpicker.js',
            'temp/amd/contextualactionpanel.js',
            'temp/amd/datepicker.js',
            'temp/amd/datagrid.js',
            'temp/amd/dropdown.js',
            'temp/amd/drag.js',
            'temp/amd/editor.js',
            'temp/amd/expandablearea.js',
            'temp/amd/flyingfocus.js',
            'temp/amd/form.js',
            'temp/amd/fileupload.js',
            'temp/amd/header.js',
            'temp/amd/hierarchy.js',
            'temp/amd/homepage.js',
            'temp/amd/initialize.js',
            'temp/amd/lookup.js',
            'temp/amd/listview.js',
            'temp/amd/pager.js',
            'temp/amd/popdown.js',
            'temp/amd/popupmenu.js',
            'temp/amd/progress.js',
            'temp/amd/mask.js',
            'temp/amd/multiselect.js',
            'temp/amd/message.js',
            'temp/amd/modal.js',
            'temp/amd/modalsearch.js',
            'temp/amd/rating.js',
            'temp/amd/resize.js',
            'temp/amd/searchfield.js',
            'temp/amd/sidebar.js',
            'temp/amd/shell.js',
            'temp/amd/signin.js',
            'temp/amd/slider.js',
            'temp/amd/sort.js',
            'temp/amd/spinbox.js',
            'temp/amd/toast.js',
            'temp/amd/tabs.js',
            'temp/amd/textarea.js',
            'temp/amd/timepicker.js',
            'temp/amd/tmpl.js',
            'temp/amd/toolbar.js',
            'temp/amd/tooltip.js',
            'temp/amd/tree.js',
            'temp/amd/validation.js',
            'temp/amd/verticaltabs.js',
            'temp/amd/wizard.js'
          ]
        }
      }
    },

    uglify: {
      dist: {
        options: {
          banner: '<%= banner %>',
          sourceMap: true,
          sourceMapName: 'dist/js/sohoxi.map',
          separator: ';'
        },
        files: {
          'dist/js/sohoxi.min.js': ['dist/js/sohoxi.js']
        }
      }
    },

    copy: {
      main: {
        files: [
          {expand: true, flatten: true, src: ['dist/js/sohoxi.js'], dest: 'public/js/', filter: 'isFile'},
          {expand: true, flatten: true, src: ['dist/js/sohoxi.min.js'], dest: 'public/js/', filter: 'isFile'},
          {expand: true, flatten: true, src: ['js/sohoxi-angular.js'], dest: 'public/js/', filter: 'isFile'},
          {expand: true, flatten: true, src: ['js/sohoxi-angular.js'], dest: 'dist/js/', filter: 'isFile'},
          {expand: true, flatten: true, src: ['js/sohoxi-knockout.js'], dest: 'public/js/', filter: 'isFile'},
          {expand: true, flatten: true, src: ['js/sohoxi-knockout.js'], dest: 'dist/js/', filter: 'isFile'},
          {expand: true, flatten: true, src: ['js/*.js'], dest: 'dist/js/all/', filter: 'isFile'},
          {expand: true, flatten: true, src: ['public/stylesheets/*-theme.css'], dest: 'dist/css/', filter: 'isFile'},
          {expand: true, flatten: true, src: ['public/stylesheets/css-only.css'], dest: 'dist/css/', filter: 'isFile'},
          {expand: true, flatten: true, src: ['js/demo/demo.js'], dest: 'public/js/', filter: 'isFile'},
          {expand: true, flatten: true, src: ['js/demo/syntax.js'], dest: 'public/js/', filter: 'isFile'},
          {expand: true, flatten: true, src: ['js/vendor/jquery-3*.js'], dest: 'public/js/', filter: 'isFile'},
          {expand: true, flatten: true, src: ['js/vendor/jquery-3*.min.js'], dest: 'public/js/', filter: 'isFile'},
          {expand: true, flatten: true, src: ['js/vendor/jquery-3*.map'], dest: 'public/js/', filter: 'isFile'},
          {expand: true, flatten: true, src: ['js/vendor/d3.*'], dest: 'public/js/', filter: 'isFile'},
          {expand: true, flatten: true, src: ['js/vendor/jquery-3*.js'], dest: 'dist/js/', filter: 'isFile'},
          {expand: true, flatten: true, src: ['js/vendor/jquery-3*.min.js'], dest: 'dist/js/', filter: 'isFile'},
          {expand: true, flatten: true, src: ['js/vendor/jquery-3*.map'], dest: 'dist/js/', filter: 'isFile'},
          {expand: true, flatten: true, src: ['js/vendor/d3.*'], dest: 'dist/js/', filter: 'isFile'},
          {expand: true, flatten: true, src: ['js/cultures/*.*'], dest: 'public/js/cultures/', filter: 'isFile'},
          {expand: true, flatten: true, src: ['js/cultures/*.*'], dest: 'dist/js/cultures/', filter: 'isFile'}
        ]
      },
      amd: {
        files: [
          {expand: true, flatten: true, src: ['js/*.*'], dest: 'temp/amd/', filter: 'isFile'}
        ]
      }
    },

    // Minify css
    cssmin: {
      dist: {
        files: {
          'dist/css/high-contrast-theme.min.css': ['dist/css/high-contrast-theme.css'],
          'dist/css/dark-theme.min.css': ['dist/css/dark-theme.css'],
          'dist/css/grey-theme.min.css': ['dist/css/grey-theme.css'],
          'dist/css/css-only.min.css': ['dist/css/css-only.css'],
        }
      }
    },

    usebanner: {
      dist: {
        options: {
          position: 'top',
          banner: '<%= banner %>',
          linebreak: true
        },

        files: {
          src: [
            'dist/css/508-theme.css',
            'dist/css/508-theme.min.css',
            'dist/css/dark-theme.css',
            'dist/css/dark-theme.min.css',
            'dist/css/grey-theme.css',
            'dist/css/grey-theme.min.css',
            'dist/css/css-only.css',
            'dist/css/css-only.min.css',
            'dist/js/all/*.js'
          ]
        }
      }
    },

    // Git Revision
    revision: {
      options: {
        property: 'meta.revision',
        ref: 'HEAD',
        short: false
      }
    },

    meta: {
      revision: undefined
    },

    strip_code: { // jshint ignore:line
      options: {
        start_comment: 'start-amd-strip-block', // jshint ignore:line
        end_comment: 'end-amd-strip-block' // jshint ignore:line
      },
      src: {
        src: 'temp/amd/*.js'
      }
    },

    clean: {
      amd: ['temp']
    },

    run: {
      'selenium-start': {
        options: {
          ready: new RegExp('Selenium started'),
          wait: false
        },
        cmd: 'selenium-standalone',
        args: ['start'],
      },

      'intern-functional-local': {
        options: {
          ready: new RegExp('SoHo Xi Tests Completed!'),
          wait: false
        },
        cmd: './node_modules/.bin/intern-runner',
        args: ['config=test2/intern.local.functional']
      },

      'intern-unit-only': {
        options: {
          ready: new RegExp('SoHo Xi Tests Completed!'),
          wait: false
        },
        cmd: './node_modules/.bin/intern-client',
        args: ['config=test2/intern.local.unit']
      },

      'intern-saucelabs': {
        options: {
          ready: new RegExp('SoHo Xi Tests Completed!'),
          wait: false
        },
        cmd: './node_modules/.bin/intern-runner',
        args: ['config=test2/intern.saucelabs']
      },

    },

  });

  // load all grunt tasks from 'node_modules' matching the `grunt-*` pattern
  require('load-grunt-tasks')(grunt);

  grunt.registerTask('default', [
    'revision',
    'jshint',
    'sass',
    'copy:amd',
    'strip_code',
    'concat',
    'clean',
    'uglify',
    'copy:main',
    'cssmin',
    'usebanner'
  ]);

  // Don't do any uglify/minify/jshint while the Dev Watch is running.
  grunt.registerTask('sohoxi-watch', [
    'revision', 'sass', 'copy:amd', 'strip_code','concat', 'clean', 'copy:main', 'usebanner'
  ]);

  grunt.registerTask('test', 'Runs unit or functional test suites using Intern.', function() {
    var options = {
      type: grunt.option('type') || 'all',
      user: grunt.option('user') || undefined,
      key: grunt.option('accessKey') || undefined,
    };

    var internConfigs = {
      'all': 'intern-functional-local',
      'unit': 'intern-unit-only',
      'functional': 'intern-functional-local',
      'build': 'intern-saucelabs'
    };

    if (internConfigs[options.type] === undefined) {
      options.type = 'all';
    }

    if (options.type === 'build') {
      // Check to make sure user and access key were provided
      if (!options.user || !options.user.toString().length) {
        grunt.fail.warn('No user ID provided for "build" test type.  Cannot call out to SauceLabs without a valid user ID.');
      }

      if (!options.key || !options.key.toString().length) {
        grunt.fail.warn('No access key provided for user "'+ options.user +'" and "build" test type.  Cannot call out to SauceLabs without a valid access key.');
      }
    }

    // Build task queue
    var tasks = [];
    if (options.type !== 'unit') {
      tasks.push('run:selenium-start');
    }
    tasks.push('run:' + internConfigs[options.type]);

    grunt.task.run(tasks);
  });

};
