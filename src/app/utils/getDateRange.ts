const getDateRange = (range: string) => {
  const now = new Date();
  let startDate: Date;

  switch (range) {
    case "today":
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      break;

    case "7days":
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 6);
      break;

    case "30days":
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 29);
      break;

    default:
      startDate = new Date(0); // all time
  }

  return { startDate, endDate: now };
};
