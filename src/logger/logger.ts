// A simple, dependency-free logger for Deno.

export enum LogLevel {
  Minimal,
  Verbose,
}

interface LoggerConfig {
  level: LogLevel;
  logFile: string;
}

// A global config object for simplicity.
const config: LoggerConfig = {
  level: LogLevel.Minimal,
  logFile: "training.log",
};

/**
 * Sets up the logger configuration and clears the log file.
 * @param level The desired logging level (Minimal or Verbose).
 * @param logFile The path to the log file.
 */
export async function setupLogger(level: LogLevel, logFile = "training.log"): Promise<void> {
  config.level = level;
  config.logFile = logFile;
  try {
    // Clear the log file on setup.
    await Deno.writeTextFile(config.logFile, "");
  } catch (e) {
    console.error(`Failed to initialize log file at ${logFile}:`, e);
  }
}

async function writeLog(message: string) {
  try {
    await Deno.writeTextFile(config.logFile, message + "\n", { append: true });
  } catch (e) {
    console.error("Failed to write to log file:", e);
  }
}

/** Logs an informational message to the console and file. */
export function info(message: string) {
  const logMessage = `[INFO] ${message}`;
  console.log(logMessage);
  writeLog(logMessage);
}

/** Logs a debug message if the log level is set to Verbose. */
export function debug(message: string) {
  if (config.level === LogLevel.Verbose) {
    const logMessage = `[DEBUG] ${message}`;
    console.log(logMessage);
    writeLog(logMessage);
  }
}

/** Logs an error message to the console and file. */
export function error(message: string) {
  const logMessage = `[ERROR] ${message}`;
  console.error(logMessage);
  writeLog(logMessage);
}
