#!/bin/bash
# Build and analyze bundle sizes

echo "Building production bundle..."
npm run build

echo "Bundle analysis:"
echo "Main bundle files:"
ls -la build/static/js/ | head -10

echo ""
echo "CSS files:"
ls -la build/static/css/

echo ""
echo "You can use 'npx webpack-bundle-analyzer build/static/js/*.js' to get detailed analysis"
echo "Or upload the source map files to https://webpack.github.io/analyse/ for analysis"
