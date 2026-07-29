import moment from "moment";

export const getDayLabel = (timestamp: string): string => {
  const messageDate = moment(timestamp);
  const today = moment();
  const yesterday = moment().subtract(1, "days");

  if (messageDate.isSame(today, "day")) {
    return "Today";
  } else if (messageDate.isSame(yesterday, "day")) {
    return "Yesterday";
  } else {
    return messageDate.format("DD/MM/YYYY"); // Format for any other day
  }
};
