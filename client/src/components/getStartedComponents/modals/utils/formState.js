import valueToLabelMap from "./valueToLabelMap";
export const initialFormState = {
  experience: 3,
  usageFrequency: 2,
  difficultySatisfaction: 3,
  iqAccuracy: 3,
  uiDesignRating: 3,
  iqGraphHelpfulness: 3,
  iqBarGraphUsefulness: 3,
  societyMotivation: 3,
  technicalIssuesFrequency: 3,
  recommendationLikelihood: 3,
};

export const handleSliderChange = (setFormState) => (name) => (value) => {
  setFormState((prevState) => ({
    ...prevState,
    [name]: value,
  }));
};

export const getLabelForValue = (name, value) => {
  //   console.log("name :", name);
  //   console.log("value :", value);
  return valueToLabelMap[name][value - 1];
};

export const getColorForLabel = (label) => {
  switch (label) {
    case "Rarely":
    case "Very Dissatisfied":
    case "Very Not Useful":
    case "Very Unhelpful":
    case "Strongly Disagree":
    case "Very Not Motivating":
    case "Never":
    case "Definitely Not":
      return "red.500";
    case "Poor":
      return "red.500";
    case "Monthly":
    case "Dissatisfied":
    case "Not Useful":
    case "Unhelpful":
    case "Disagree":
    case "Not Motivating":
    case "Rarely":
    case "Probably Not":
      return "white";
    case "Average":
      return "white";
    case "Weekly":
    case "Neutral":
    case "Sometimes":
    case "Not Sure":
      return "yellow.500";
    case "Good":
      return "yellow.500";
    case "Daily":
    case "Satisfied":
    case "Useful":
    case "Helpful":
    case "Agree":
    case "Motivating":
    case "Often":
    case "Probably":
      return "green.500";
    case "Excellent":
      return "green.500";
    case "Very Satisfied":
    case "Very Useful":
    case "Very Helpful":
    case "Strongly Agree":
    case "Very Motivating":
    case "Always":
    case "Definitely":
      return "green.500";
    default:
      return "white";
  }
};
