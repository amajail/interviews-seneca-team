module.exports = {
  'backend/**/*.ts': (filenames) => {
    return [
      `npx eslint --config backend/eslint.config.mjs --fix ${filenames.join(' ')}`,
      `npx prettier --config backend/.prettierrc --write ${filenames.join(' ')}`,
    ];
  },
};
