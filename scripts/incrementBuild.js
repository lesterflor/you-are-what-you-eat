const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Increment or initialize the build number
pkg.buildNumber = (pkg.buildNumber || 1) + 0.1;

// Write it back
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
console.log(`Build number incremented to ${pkg.buildNumber}`);
