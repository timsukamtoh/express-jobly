"use strict";

const {
  NotFoundError,
  BadRequestError
} = require("../expressError");
const db = require("../db.js");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    id: 4,
    title: "job4",
    salary: 400000,
    equity: "0",
    companyHandle: "c1"
  };
  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual(newJob);

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           WHERE id = 4`);
    expect(result.rows).toEqual([
      {
        id: 4,
        title: "job4",
        salary: 400000,
        equity: "0",
        companyHandle: "c1",
      },
    ]);
  });

  test("bad request with dupe", async function () {
    try {
      await Job.create(newJob);
      await Job.create(newJob);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("find all jobs", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: 1,
        title: "job1",
        salary: 100000,
        equity: "0",
        companyHandle: "c1",
      },
      {
        id: 2,
        title: "job2",
        salary: 200000,
        equity: "0",
        companyHandle: "c2",
      },
      {
        id: 3,
        title: "job3",
        salary: 300000,
        equity: "0.5",
        companyHandle: "c3",
      }
    ]);
  });

});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let job = await Job.get(3);
    expect(job).toEqual({
      id: 3,
      title: "job3",
      salary: 300000,
      equity: "0.5",
      companyHandle: "c3",
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(0);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */
describe("update", function () {
  const updateData = {
    title: "job3",
    salary: 300001,
    equity: "0.5",
    companyHandle: "c3",
  };

  test("works", async function () {
    let job = await Job.update(3, updateData);
    expect(job).toEqual({
      id: 3,
      ...updateData,
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           WHERE id = 3`);
    expect(result.rows).toEqual([{
      id: 3,
      title: "job3",
      salary: 300001,
      equity: "0.5",
      companyHandle: "c3",
    }]);
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove(1);
    const res = await db.query(
      "SELECT id FROM jobs WHERE id=1");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(0);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
