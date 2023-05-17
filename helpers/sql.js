"use strict";

const { BadRequestError } = require("../expressError");

/**
 * This function takes in the inputs that will be used for a patch request
 * Converts the format of those columns to be usable in SQL
 * @param {Object} dataToUpdate Inputs to update
 * @param {*} jsToSql Formatting conversion object
 * @returns an Object containing columns to be changed and a corresponding array of their values
 */
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
