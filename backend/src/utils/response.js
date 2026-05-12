const ok = (res, data = {}, message = 'Success', statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data });

const created = (res, data = {}, message = 'Created') =>
  ok(res, data, message, 201);

const fail = (res, message = 'Bad request', statusCode = 400, errors = null) => {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
};

const unauthorized = (res, message = 'Unauthorized') =>
  fail(res, message, 401);

const forbidden = (res, message = 'Forbidden') =>
  fail(res, message, 403);

const notFound = (res, message = 'Not found') =>
  fail(res, message, 404);

const serverError = (res, message = 'Internal server error') =>
  fail(res, message, 500);

module.exports = { ok, created, fail, unauthorized, forbidden, notFound, serverError };
