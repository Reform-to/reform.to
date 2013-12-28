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
          'css/app.css': 'scss/app.scss'
        }
      }
    },

    clean: ['dist'],

    copy: {
      main: {
        files: [
          { expand: true, src: ['index.html'], dest: 'dist/'},
          { expand: true, src: ['candidates/**'], dest: 'dist/'},
          { expand: true, src: ['favicon.ico'], dest: 'dist/'},
          { expand: true, src: ['css/**'], dest: 'dist/'},
          { expand: true, src: ['img/**'], dest: 'dist/'},
          { expand: true, src: ['js/**'], dest: 'dist/'},
          { expand: true, src: ['vendor/**'], dest: 'dist/'}
        ]
      }
    },

    watch: {
      grunt: { files: ['Gruntfile.js'] },

      sass: {
        files: 'scss/**/*.scss',
        tasks: ['sass']
      }
    }
  });

  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('build', ['sass']);
  grunt.registerTask('default', ['build','watch']);
  grunt.registerTask('dist', ['clean', 'build', 'copy']);

}
