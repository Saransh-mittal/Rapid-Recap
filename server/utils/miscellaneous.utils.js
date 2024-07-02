function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return -1; // Target not found
}

function binarySearchForLeftRange(arr, lowerbound) {
  if (arr[arr.length - 1] < lowerbound) return -1;
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] >= lowerbound) {
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }

  return left; // Target not found
}

function binarySearchForRightRange(arr, upperbound) {
  if (arr[0] > upperbound) return -1;
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] <= upperbound) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return right; // Target not found
}

function isValidEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

function formatDate(datetime) {
  // Extract the date part
  const datePattern = /^\d{4}-\d{2}-\d{2}/;
  const match = datetime.match(datePattern);
  if (!match) return null;

  // Parse the extracted date part
  const [year, month, day] = match[0].split("-");

  // Define month abbreviations
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Format the date into 'dd mmm yyyy'
  const formattedDate = `${day} ${months[parseInt(month, 10) - 1]} ${year}`;
  return formattedDate;
}

function averageReadTime(text) {
  // Remove the article if it has no text
  if (!text || text.length === 0 || text === "") {
    return null;
  }

  // Calculate reading time in minutes
  const wordsPerMinute = 100;
  const plainText = text.replace(/<[^>]+>/g, ""); // Remove HTML tags
  const wordCount = plainText.split(/\s+/).length;
  const readingTimeMinutes = Math.ceil(wordCount / wordsPerMinute);
  return readingTimeMinutes;
}

module.exports = {
  binarySearch,
  binarySearchForLeftRange,
  binarySearchForRightRange,
  isValidEmail,
  formatDate,
  averageReadTime,
};
