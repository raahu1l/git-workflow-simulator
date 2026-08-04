const { spawn } = require("child_process");

const bash = spawn("bash");

bash.stdout.on("data", (data) => {
  console.log("OUTPUT:");
  console.log(data.toString());
});

bash.stderr.on("data", (data) => {
  console.log("ERROR:");
  console.log(data.toString());
});

bash.stdin.write("pwd\n");
bash.stdin.write("ls\n");
bash.stdin.write("echo Hello Rahul!\n");

setTimeout(() => {
  bash.stdin.write("exit\n");
}, 1000);