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
          'tmp/result/css/app.css': 'scss/app.scss'
        }
      }
    },

    clean: {
      dist: ['dist'],
      tmp: ['tmp']
    },

    copy: {
      main: {
        files: [
          {
            expand: true,
            src: ['vendor/**'],
            dest: 'tmp/result'
          },
          {
            expand: true,
            dot: true,
            cwd: 'public/',
            src: ['**/*'],
            dest: 'tmp/result'
          },
        ]
      },
      react: {
        files: [
          {
            expand: true,
            cwd: 'jsx/',
            src: ['**/*'],
            dest: 'tmp/result/js'
          },
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

    watch: {
      grunt: { files: ['Gruntfile.js'] },

      sass: {
        files: 'scss/**/*.scss',
        tasks: ['sass']
      },

      react: {
        files: 'jsx/**/*.jsx',
        tasks: ['copy:react']
      }
    }
  });

  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('build', ['copy:main', 'copy:react', 'sass']);
  grunt.registerTask('default', ['clean:tmp', 'build','watch']);
  grunt.registerTask('dist', ['clean', 'build', 'copy:dist']);

}
