const babel = require('@babel/core');

module.exports = {
  process(src, filename) {
    // Replace import.meta.env.SOMETHING with globalThis.__IMPORT_META_ENV__.SOMETHING
    const replaced = src.replace(/import\.meta\.env\./g, 'globalThis.__IMPORT_META_ENV__.');

    const result = babel.transformSync(replaced, {
      filename,
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        '@babel/preset-react',
        '@babel/preset-typescript'
      ],
      plugins: [],
      sourceMaps: 'inline'
    });

    return {
      code: result.code,
      map: result.map
    };
  }
};
