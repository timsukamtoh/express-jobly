"use strict";

const request = require("supertest");
const { BadRequestError } = require("../expressError");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    id: 4,
    title: "job4",
    salary: 400000,
    equity: 0,
    companyHandle: "c1",
  };

  test("ok for admin users to post job", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${u1Token}`);

    expect(resp.statusCode).toEqual(201);

    delete newJob.equity;
    expect(resp.body).toEqual({
      job: { equity: `0`, ...newJob },
    });
  });

  test("fails for non-admin users to post job", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "job4",
        //schema
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        ...newJob,
        equity: 2
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});
/************************************** GET /jobs/:id */
describe("GET /jobs/:id", function () {
  test("anon allow to see the job post", async function () {
    const resp = await request(app).get(`/jobs/1`);
    expect(resp.body).toEqual({
      job: {
        id: 1,
        title: "job1",
        salary: 100000,
        equity: "0",
        companyHandle: "c1",
      },
    });
  });

  test("not found for that job", async function () {
    const resp = await request(app).get(`/jobs/0`);
    expect(resp.statusCode).toEqual(404);
  });

});

/************************************** PATCH /jobs/:id */
describe("PATCH /jobs/:id", function () {
  test("works for admin users", async function () {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        title: "newJob",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      job: {
        id: 1,
        title: "newJob",
        salary: 100000,
        equity: "0",
        companyHandle: "c1",
      },
    });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        title: "newJob",
      });
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for non-admin users", async function () {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        title: "newJob",
      })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for that job", async function () {
    const resp = await request(app)
      .patch(`/jobs/0`)
      .send({
        title: "new nope",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on job id change attempt", async function () {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        id: 1,
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        equity: "2",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
  test("works for admin users", async function () {
    const resp = await request(app)
      .delete(`/jobs/1`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({ deleted: "1" });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
      .delete(`/jobs/1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for non-admin users", async function () {
    const resp = await request(app)
      .delete(`/jobs/1`)
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for that job", async function () {
    const resp = await request(app)
      .delete(`/jobs/0`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});
