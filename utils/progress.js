// Define your progress bar function
function progressBar(totalItems) {
  const width = 50; // Width of the progress bar
  let progress = 0;

  // Function to update the progress bar
  function updateProgress() {
    const percentage = Math.round((progress / totalItems) * 100);
    const completed = Math.round((progress / totalItems) * width);
    const remaining = width - completed;
    const bar = "[" + "=".repeat(completed) + " ".repeat(remaining) + "]";
    process.stdout.clearLine(); // Clear the previous line
    process.stdout.cursorTo(0); // Move the cursor to the beginning of the line
    process.stdout.write(bar + " " + percentage + "%"); // Write the progress bar
  }

  // Initialize the progress bar
  updateProgress();

  // Return a function to update progress and handle completion
  return function incrementProgress() {
    progress++;
    updateProgress();
    if (progress === totalItems) {
      process.stdout.write("\n"); // Move to the next line
    }
  };
}

module.exports = { progressBar };
