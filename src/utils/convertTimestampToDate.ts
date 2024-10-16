export const convertTimestampToDate = (timestamp: {
  seconds: number;
  nanoseconds: number;
}) => {
  return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
};
