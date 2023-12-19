
// Replace placeholders in the template with actual values
function GetFilledHtml(date_ph, total_count_ph, templateContent) {
  const templateVariables = {
    date_ph: date_ph,
    total_count_ph: total_count_ph,
  };

  let updatedHtml = templateContent;
  Object.keys(templateVariables).forEach((key) => {
    const placeholder = `{${key}}`;
    updatedHtml = updatedHtml.replace(
      new RegExp(placeholder, "g"),
      templateVariables[key]
    );
  });
  return updatedHtml;
}

// console.log(GetFilledHtml("12/Dec/2023", "29"));

module.exports = { GetFilledHtml };
