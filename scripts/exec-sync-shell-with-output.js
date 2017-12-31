const { execSync } = require('child_process');

module.exports = function execSyncShellWithOutput(command) {
  execSync(command, (err, stdout, stderr) => {
    if (err) {
      console.log("Command couldn't be run");
      console.log(err);
      return;
    }

    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
  });
};
