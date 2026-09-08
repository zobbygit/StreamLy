// Centralized error handler. Keeps error shapes consistent and avoids
// leaking stack traces in production responses.
function errorHandler(err, req, res, next) {
  console.error("[error]", err);

  if (err.name === "ZodError") {
    return res.status(400).json({
      message: "Validation failed.",
      errors: err.errors?.map((e) => ({ path: e.path.join("."), message: e.message })),
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return res.status(409).json({ message: `${field} already in use.` });
  }

  const status = err.statusCode || 500;
  const message =
    status === 500 && process.env.NODE_ENV === "production"
      ? "Something went wrong. Please try again."
      : err.message || "Something went wrong.";

  res.status(status).json({ message });
}

function notFoundHandler(req, res) {
  res.status(404).json({ message: "Route not found." });
}

module.exports = { errorHandler, notFoundHandler };
