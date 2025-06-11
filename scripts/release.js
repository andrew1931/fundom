const { execSync } = require('node:child_process');

function run(command) {
   console.log(`\n> ${command}`);
   execSync(command, { stdio: 'inherit' });
}

const type = process.argv[2];

if (!['patch', 'minor', 'major'].includes(type)) {
   console.error('usage: node release.js [patch|minor|major]');
   process.exit(1);
}

run(`npm version ${type}`);
run('git push');
run('git push --tags');

