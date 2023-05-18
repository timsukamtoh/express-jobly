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
    setCols: cols.join(", "), //`"first_name"=$1, "last_name"=$2, "email"=$3`
    values: Object.values(dataToUpdate),//"NewF", "NewF", "new@email.com"
  };
}

/**
 * Helper function takes in an array of conditionals to be used in building a SQL
 * WHERE clause if the array.length > 0
 * @param {Array} searchFilters array of sql conditionals
 * @returns the joined string
 */
function buildString(searchFilters){
  return searchFilters.length > 0 ? `WHERE ${searchFilters.join(' AND ')}` : '';
}

module.exports = { sqlForPartialUpdate, buildString };
