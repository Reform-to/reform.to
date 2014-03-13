module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jquery: {
      dist: {
        options: {
          prefix: 'jquery-',
          minify: true
        },
        output: 'tmp/result/js/lib',
        versions: {
          "2.0.3": ['css', 'deprecated', 'dimensions', 'effects', 'event-alias', 'offset', 'sizzle', 'wrap']
        }
      }
    },

    sass: {
      options: {
        includePaths: ['vendor/foundation/scss']
      },
      dev: {
        files: {
          'tmp/result/css/app.css': 'app/scss/app.scss'
        }
      },
      dist: {
        options: {
          outputStyle: 'compressed'
        },
        files: {
          'tmp/result/css/app.css': 'app/scss/app.scss'
        }
      }
    },

    clean: {
      dist: ['dist'],
      tmp: ['tmp']
    },

    react: {
      main: {
        files: {
            'tmp/compiled/js/app.js': 'app/jsx/app.jsx'
        }
      }
    },

    jshint: {
      app: ['tmp/compiled/js/**/*.js']
    },

    preprocess: {
      dev: {
        src : 'app/index.html', dest : 'tmp/result/index.html',
        options: { context: { dist: false } }
      },
      dist: {
        src : 'app/index.html', dest : 'tmp/result/index.html',
        options: { context: { dist: true } }
      }
    },

    concat: {
      dev: {
        src: ['config/environment.js', 'config/environments/development.js'],
        dest: 'tmp/result/js/config.js'
      },
      dist: {
        src: ['config/environment.js', 'config/environments/production.js'],
        dest: 'tmp/result/js/config.js'
      }
    },

    copy: {
      compiled: {
        files: [
          {
            expand: true,
            cwd: 'tmp/compiled',
            src: ['**/*'],
            dest: 'tmp/result'
          }
        ]
      },
      vendor: {
        files: [
          {
            expand: true,
            src: ['vendor/**'],
            dest: 'tmp/result'
          }
        ]
      },
      assets: {
        files: [
          {
            expand: true,
            dot: true,
            cwd: 'public/',
            src: ['**/*'],
            dest: 'tmp/result'
          }
        ]
      },
      dist: {
        files: [
          {
            expand: true,
            dot: true,
            cwd: 'tmp/result/',
            src: ['**/*'],
            dest: 'dist/'
          }
        ]
      }
    },

    uglify: {
      app: {
        files: {
          'tmp/result/js/app.min.js': ['tmp/compiled/js/app.js']
        }
      }
    },

    connect: {
      server: {
        options: {
          port: 9001,
          base: 'tmp/result'
        }
      }
    },

    watch: {
      grunt: { files: ['Gruntfile.js'] },

      sass: {
        files: 'app/scss/**/*.scss',
        tasks: ['sass']
      },

      app: {
        files: 'app/index.html',
        tasks: ['preprocess:dev']
      },

      assets: {
        files: 'public/**/*',
        tasks: ['copy:assets']
      },

      compiled: {
        files: 'tmp/compiled/**/*',
        tasks: ['copy:compiled']
      },

      jshint: {
        files: 'tmp/compiled/**/*',
        tasks: ['jshint:app']
      },

      react: {
        files: 'app/jsx/**/*.jsx',
        tasks: ['react']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-jquery-builder');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-preprocess');
  grunt.loadNpmTasks('grunt-react');
  grunt.loadNpmTasks('grunt-sass');

  grunt.registerTask('build', ['copy:vendor', 'copy:assets', 'preprocess:dev', 'jquery', 'react', 'copy:compiled', 'jshint:app']);
  grunt.registerTask('default', ['clean:tmp', 'build', 'sass:dev', 'concat:dev']);
  grunt.registerTask('server', ['clean:tmp', 'build', 'sass:dev', 'concat:dev', 'connect', 'watch']);
  grunt.registerTask('dist', ['clean', 'build', 'sass:dist', 'preprocess:dist', 'concat:dist', 'uglify', 'copy:dist']);

}
