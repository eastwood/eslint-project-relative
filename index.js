const kexec = require('kexec');
const yargs = require('yargs');
const path = require('path');
const shell = require('shelljs');
const resolve = require('resolve');
const fs = require('fs');

function getFileArgs() {
  return yargs.argv._;
}

function eslintNearFile(file) {
  if (file[0] !== '/') {
    file = path.join(shell.pwd(), file);
  }

  const dir = shell.test('-d', file) ? file : path.dirname(file);

  // resolve eslint
  try {
    const resolvedLocation = resolve.sync('eslint/package.json', { basedir: dir });
    const eslintPackageDir = path.dirname(resolvedLocation);
    const eslintPackage = JSON.parse(fs.readFileSync(resolvedLocation));
    return path.join(eslintPackageDir, eslintPackage.bin.eslint);
  } catch (err) {
    shell.echo('could not find eslint near ' + file);
    return shell.which('eslint');
  }
}

function main() {
  const options = getFileArgs();
  const relativeFrom = options.length === 0 ? shell.pwd() : options[0];
  const exe = eslintNearFile(relativeFrom);
  if (exe) {
    // shell.echo("using eslint at " + exe)
    kexec(exe, process.argv.slice(2));
  } else {
    shell.echo('eslint not found');
    process.exit(1);
  }
}

main();
