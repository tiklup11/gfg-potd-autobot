function createDailyRunGuard({ run, getDate, onSkip = () => {} }) {
  let lastSuccessfulDate;

  return async function runOnceAfterDailySuccess() {
    const currentDate = getDate();
    if (lastSuccessfulDate === currentDate) {
      onSkip(currentDate);
      return false;
    }

    const successful = await run();
    if (successful) {
      lastSuccessfulDate = currentDate;
    }
    return successful;
  };
}

function dateInTimezone(date, timezone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

  return `${values.year}-${values.month}-${values.day}`;
}

module.exports = { createDailyRunGuard, dateInTimezone };
