const fs = require('fs');

const pkgPath = 'package.json';
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

// Current version (e.g., "0.0.1")
let version = pkg.version || '0.0.0';
let parts = version.split('.').map(Number);

// Increment PATCH version (e.g., 0.0.1 -> 0.0.2)
parts[2]++;

// If patch hits 100, roll over to minor
if (parts[2] >= 100) {
	parts[2] = 0;
	parts[1]++;
}

// If minor hits 100, roll over to major
if (parts[1] >= 100) {
	parts[1] = 0;
	parts[0]++;
}

// Update version string
pkg.version = parts.join('.');
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

console.log(`📦 Version bumped to ${pkg.version}`);
