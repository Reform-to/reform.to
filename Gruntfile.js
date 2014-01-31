module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    sass: {
      options: {
        includePaths: ['vendor/foundation/scss']
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
            'tmp/result/js/app.js': 'app/jsx/app.jsx'
        }
      }
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
      app: {
      /*
        files: [
          {
            expand: true,
            cwd: 'app/',
            src: ['index.html'],
            dest: 'tmp/result'
          }
        ]
        */
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

      react: {
        files: 'app/jsx/**/*.jsx',
        tasks: ['react']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-preprocess');
  grunt.loadNpmTasks('grunt-react');
  grunt.loadNpmTasks('grunt-sass');

  grunt.registerTask('build', ['copy:vendor', 'copy:assets', 'preprocess:dev', 'react', 'sass']);
  grunt.registerTask('default', ['clean:tmp', 'build', 'concat:dev']);
  grunt.registerTask('server', ['clean:tmp', 'build', 'concat:dev', 'connect', 'watch']);
  grunt.registerTask('dist', ['clean', 'build', 'preprocess:dist', 'concat:dist', 'copy:dist']);

}
