const calculateTopPercent = (userIQ, IQScores) => {
  const sortedIQScores = IQScores.sort((a, b) => b - a);
  const index = sortedIQScores.findIndex((score) => score <= userIQ);

  return (((index + 1) / IQScores.length) * 100).toFixed(2);
};

const calculateLabelsAndData = (IQScores) => {
  const labels = Array.from({ length: 40 }, (_, i) => (i + 1) * 10);
  const data = labels.map((threshold) => {
    return IQScores.filter(
      (score) => score >= threshold - 10 && score < threshold
    ).length;
  });

  const filteredLabels = [];
  const filteredIQData = [];
  for (let i = 0; i < labels.length; i++) {
    if (data[i] !== 0) {
      filteredLabels.push(`${labels[i] - 10}-${labels[i]}`);
      filteredIQData.push(data[i]);
    }
  }

  return { filteredLabels, filteredIQData };
};

const calculatePercentilesOfEachBar = (
  IQScores,
  filteredLabels,
  filteredIQData
) => {
  const percentiles = [];

  // Define the function to calculate percentile
  const calculatePercentile = (iqScore) => {
    const sortedScores = IQScores.sort((a, b) => a - b);
    const index = sortedScores.findIndex((score) => score >= iqScore);
    return index === 0 ? 100 : 100 - ((index + 1) / sortedScores.length) * 100;
  };

  // Iterate through each data point
  for (let i = 0; i < filteredLabels.length; i++) {
    const [lowerBound, upperBound] = filteredLabels[i].split("-").map(Number);
    const percentile = calculatePercentile(lowerBound).toFixed(2);
    percentiles.push({
      lowerBound,
      upperBound,
      percentile,
      count: filteredIQData[i],
    });
  }

  return percentiles;
};

module.exports = {
  calculateTopPercent,
  calculateLabelsAndData,
  calculatePercentilesOfEachBar,
};
