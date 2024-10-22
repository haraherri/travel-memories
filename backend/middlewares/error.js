const fs = require("fs").promises;
const path = require("path");

const logError = async (err) => {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${err.name}: ${err.message}\n${err.stack}\n\n`;
  console.error(logMessage);

  const logFilePath = path.join(process.cwd(), "error.log");

  try {
    await fs.appendFile(logFilePath, logMessage);
    console.log("Error logged to file successfully");
  } catch (appendErr) {
    console.error("Failed to write to log file:", appendErr);
  }
};

const errorHandler = (err, req, res, next) => {
  logError(err);

  if (err instanceof CustomError) {
    return res.status(err.status).json({ error: err.message });
  }
  return res.status(500).json({ error: "Internal Server Error!" });
};

class CustomError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { errorHandler, CustomError };
