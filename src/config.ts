import fs from "fs";
import os from "os";
import path from "path";

// this represents what's in the json file
type Config = {
  dbUrl: string;
  currentUserName?: string;
};

function getConfigFilePath() {
  return path.join(os.homedir(), ".gatorconfig.json");
}

function validateConfig(raw: any): Config {
  if (!raw.db_url) {
    throw new Error("no db_url found in config file");
  }

  return {
    dbUrl: raw.db_url,
    currentUserName: raw.current_user_name,
  };
}

function writeConfig(cfg: Config) {
  const filePath = getConfigFilePath();
  // json keys need to be snake_case
  const toWrite = {
    db_url: cfg.dbUrl,
    current_user_name: cfg.currentUserName,
  };
  fs.writeFileSync(filePath, JSON.stringify(toWrite));
}

export function readConfig(): Config {
  const filePath = getConfigFilePath();
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(fileContent);
  return validateConfig(parsed);
}

export function setUser(username: string) {
  const cfg = readConfig();
  cfg.currentUserName = username;
  writeConfig(cfg);
}
