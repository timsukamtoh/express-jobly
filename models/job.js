"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate, buildString } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { id, title, salary, equity, companyHandle }
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * Throws BadRequestError if job is already in database.
   * */

  static async create({ id, title, salary, equity, companyHandle }) {
    const duplicateCheck = await db.query(`
        SELECT id
        FROM jobs
        WHERE id = $1`, [id]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate job: ${id}`);

    const result = await db.query(`
                INSERT INTO jobs (id,
                                  title,
                                  salary,
                                  equity,
                                  company_handle)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING
                    id,
                    title,
                    salary,
                    equity,
                    company_handle AS "companyHandle"`,
                [
                  id,
                  title,
                  salary,
                  equity,
                  companyHandle
                ]);
    const job = result.rows[0];

    return job;
  }

  /** Find all jobs based on search query.
   *
   * Returns [{ id, title, salary, equity, companyHandle }, ...]
   * */

  static async findAll(search = {}) {
    const searchFilters = [];
    const params = [];

  

    /**For each property, if they exist, push them into search filters and params */
    if (search.title) {
      searchFilters.push(`title ILIKE $${params.length + 1}`);
      params.push(`%${search.title}%`);
    }

    if (search.minSalary) {
      searchFilters.push(`salary >= $${params.length + 1}`);
      params.push(search.minSalary);
    }

    if (search.hasEquity) {
      searchFilters.push(`equity >= $${params.length + 1}`);
      params.push(0);
    }

    //Creates the String for the WHERE clause
    const filterString = buildString(searchFilters);

    const jobsResults = await db.query(
      `SELECT id,
              title,
              salary,
              equity,
              company_handle AS "companyHandle"
          FROM jobs
          ${filterString}
          ORDER BY id`,
            params
          );

    return jobsResults.rows;
  }

  /** Given a job id, return data about that job.
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const results = await db.query(`
        SELECT id,
                title,
                salary,
                equity,
                company_handle AS "companyHandle"
            FROM jobs
            WHERE id = $1`, [id]);

    const job = results.rows[0];

    if (!job) throw new NotFoundError(`No job: ${job}`);

    return job;
  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: { title, salary, equity }
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
      data,
      {
        companyHandle: "company_handle"
      });
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `
        UPDATE jobs
        SET ${setCols}
        WHERE id = ${idVarIdx}
        RETURNING
              id,
              title,
              salary,
              equity,
              company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

  static async remove(id) {
    const result = await db.query(`
        DELETE
        FROM jobs
        WHERE id = $1
        RETURNING id`, [id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);
  }
}


module.exports = Job;
