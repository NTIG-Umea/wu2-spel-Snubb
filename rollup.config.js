import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
    input: 'src/js/game.js',
    output: [
        {
            sourcemap: true,
            format: 'iife',
            name: 'game',
            file: 'dist/js/bundle.js',
            intro: 'const global = window;'
        }
    ],
    plugins: [
        nodeResolve(),
        commonjs()
    ]
};
