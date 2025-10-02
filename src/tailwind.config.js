/* eslint-env node */
module.exports = {
    content: [
      './src/**/*.{html,jsx,tsx}',
      './node_modules/@rewind-ui/core/dist/theme/styles/*.js'
    ],
    plugins: [
      require('@tailwindcss/typography'),
      require('tailwind-scrollbar')({ nocompatible: true }),
      require('@tailwindcss/forms')({
        strategy: 'class' // only generate classes
      })
    ]
  };