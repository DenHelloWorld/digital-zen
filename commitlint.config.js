module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'chore', 'refactor', 'style', 'docs', 'perf', 'test'],
    ],
    'scope-enum': [2, 'always', ['core', 'common', 'focus', 'auth', 'menu']],
    'scope-empty': [2, 'never'],
  },
};
