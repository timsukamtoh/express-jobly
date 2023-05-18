"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  const authHeader = req.headers?.authorization;
  if (authHeader) {
    const token = authHeader.replace(/^[Bb]earer /, "").trim();

    try {
      res.locals.user = jwt.verify(token, SECRET_KEY);
    } catch (err) {
      /* ignore invalid tokens (but don't store user!) */
    }
  }
  return next();

}

/** Middleware to use when they must be logged in.
 *
 * If not, throws Unauthorized Error.
 */

function ensureLoggedIn(req, res, next) {
  if (res.locals.user && res.locals.user?.username) return next();
  throw new UnauthorizedError();
}

/** Middleware to use to check if user is an Admin
 *
 * If not, throws Unauthorized Error.
 */
function ensureIsAdmin(req, res, next) {
  if (res.locals.user && res.locals.user?.isAdmin === true) return next();
  throw new UnauthorizedError();
}

/** Middleware to use to check if user is an Admin
 * or the logged user is sent to their own route
 *
 * If not, throws Unauthorized Error.
 */
function ensureIsAdminOrCurrentUser(req, res, next) {
  if(res.locals.user) {
    if (res.locals.user?.isAdmin === true) return next();
    if (res.locals.user?.username === req.params?.username) return next();
  }
  throw new UnauthorizedError();
}


module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureIsAdmin,
  ensureIsAdminOrCurrentUser,
};
