const formatDate = (date) => {
  const formattedDate = date.toISOString().slice(0, 10).replace(/-/g, ":");
  return formattedDate;
};

module.exports = {
  formatDate,
};
