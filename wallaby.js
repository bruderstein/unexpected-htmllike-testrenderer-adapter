

var Babel = require('babel');

module.exports = function (wallaby) {

    return {
        files: [
            'src/**/*.js',
            'src/**/*.jsx',
            {
                pattern: 'src/**/tests/*.spec.js',
                ignore: true
            },
            {
                pattern: 'src/**/tests/*.spec.jsx',
                ignore: true
            }
        ],

        tests: ['src/**/*.spec.js', 'src/**/*.spec.jsx'],
        env: {
            type: 'node',
            runner: 'node'
        },

        compilers: {
            '**/*.js': wallaby.compilers.babel({
                babel: Babel
            }),
            '**/*.jsx': wallaby.compilers.babel({
                babel: Babel
            })
        }
    };
};
