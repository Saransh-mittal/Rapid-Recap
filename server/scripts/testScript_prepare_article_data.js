const { spawn } = require("child_process");
const path = require("path");

const testScript_prepare_article_data = async () => {
  try {
    const pythonScriptPath = path.join(
      __dirname,
      "..",
      "scripts",
      "prepare_article_data.py"
    );
    const pythonProcess = spawn("python", [pythonScriptPath]);

    pythonProcess.stdout.on("data", (data) => {
      console.log(`Python script output: ${data}`);
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error(`Python script error: ${data}`);
    });

    pythonProcess.on("close", async (code) => {
      console.log(`Python script exited with code ${code}`);
      if (code === 0) {
        console.log("Python script executed successfully");
      } else {
        console.log("Python script failed");
      }
    });
  } catch (error) {
    console.log(error);
  }
};

testScript_prepare_article_data();
