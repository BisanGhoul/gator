import { readConfig, setUser } from "./config.js";

function main() {
  setUser("yourname");

  const cfg = readConfig();
  console.log(cfg);
}

main();
