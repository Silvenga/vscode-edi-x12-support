
module.exports = function (wallaby) {
    return {
        files: [
            'src/**/*.ts',
            'test/index.ts',
        ],

        tests: [
            'test/**/*Tests.ts'
        ],

        testFramework: 'ava',

        compilers: {
            '**/*.ts': wallaby.compilers.typeScript({
                // TypeScript compiler specific options
                // https://github.com/Microsoft/TypeScript/wiki/Compiler-Options
                // (no need to duplicate tsconfig.json, if you have it, it'll be automatically used)
            })
        },
        env: {
            type: 'node',
            runner: 'node'
        },
        debug: true
    };
};