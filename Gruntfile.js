'use strict';

module.exports = function (grunt) {
  grunt.initConfig({
    lambda_invoke: {
      default: {}
    },
    lambda_package: {
      default: {}
    },
    lambda_deploy: {
      default: {
        arn: "arn:aws:lambda:us-east-1:899713854521:function:traffic",
        options: {
          timeout: 10,
          memory: 128,
          RoleArn: "lambda_basic_execution",
          credentialsJSON: "./credentials.json"
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-aws-lambda');

  grunt.registerTask('deploy', ['lambda_package', 'lambda_deploy']);
};