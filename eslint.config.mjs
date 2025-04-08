import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
    eslint.configs.recommended,
    tseslint.configs.strict,
    tseslint.configs.stylistic,
    eslintConfigPrettier,
    {
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
        rules: {
            eqeqeq: 'warn',
            'no-unused-vars': 'off',
            quotes: ['warn', 'single'],
            'semi': ['error', 'always'],
            'no-undef': 'error',
            'arrow-parens': ['warn', 'always'],
            '@typescript-eslint/explicit-module-boundary-types': 'warn',
            '@typescript-eslint/no-unused-vars': ['error']
        }
    }
);