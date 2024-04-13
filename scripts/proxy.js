const { exec } = require('child_process');
const { existsSync } = require('fs');
const path = require('path');
const whistleConfig = path.resolve(__dirname, '../.whistle.js');

function isW2Running() {
  return new Promise((resolve, reject) => {
    exec('w2 status', (err, stdout, stderr) => {
      if (err) {
        reject(err);
        return;
      }
      const isRunning =
        stdout.includes('whistle') &&
        stdout.includes('running') &&
        !stdout.includes('No running');
      resolve(isRunning);
    });
  });
}

function startW2() {
  return new Promise((resolve, reject) => {
    exec('w2 start', (err, stdout, stderr) => {
      if (err) {
        reject(err);
        return;
      }
      const isRunning =
        stdout.includes('whistle') &&
        stdout.includes('started')
      resolve(isRunning);
    });
  });
}

function addRules() {
  return new Promise((resolve, reject) => {
    if(!existsSync(whistleConfig)){
      console.log('whistle config not found');
      resolve(false);
      return;
    }
    exec(`w2 add ${whistleConfig}`, (err, stdout, stderr) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(true);
    });
  });
}

function removeRules() {
  return new Promise((resolve, reject) => {
    exec(`w2 remove ${whistleConfig}`, (err, stdout, stderr) => {
      if (err) {
        console.error(err);
        reject(err);
        return;
      }
      console.log(stdout);
      resolve(true);
    });
  });
}

async function main(){
  const isRunning = await isW2Running();
  if (isRunning) {
    console.log('whistle is running');
  }
  else {
    const started = await startW2();
    if (started) {
      console.log('whistle started');
    }
    else {
      console.log('whistle failed to start');
      return;
    }
  }
  await addRules();
}

main();
