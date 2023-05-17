"use strict";

const { sqlForPartialUpdate } = require("./sql");
const db = require("../db.js");

const { BadRequestError } = require("../expressError");


describe("partial Update", function () {

  test("works for users", function () {
    const updateData = {
      firstName: "NewF",
      lastName: "NewF",
      email: "new@email.com"
    };
    const { setCols, values } = sqlForPartialUpdate(
      updateData,
      {
        firstName: "first_name",
        lastName: "last_name",
        isAdmin: "is_admin"
      });
    expect(setCols).toEqual(`"first_name"=$1, "last_name"=$2, "email"=$3`);
    expect(values).toEqual(["NewF", "NewF", "new@email.com"]);
  });

  test("fails without data", function () {
    const badInputs = {};
    const jsToSql = {
      firstName: "first_name",
      lastName: "last_name",
      isAdmin: "is_admin"
    };

    try {
      const result = sqlForPartialUpdate(badInputs, jsToSql);
    } catch (err) {
      expect(err.message).toEqual("No data");
    }

    expect(() => {
      sqlForPartialUpdate(badInputs, jsToSql);
    }).toThrow(BadRequestError);
  });
});