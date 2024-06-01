module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true,
    "vue/setup-compiler-macros": true,
  },
  extends:[
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-prettier/skip-formatting'
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  }
};