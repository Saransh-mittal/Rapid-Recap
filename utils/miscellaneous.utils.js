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

module.exports = {
  binarySearch,
  binarySearchForLeftRange,
  binarySearchForRightRange,
};
