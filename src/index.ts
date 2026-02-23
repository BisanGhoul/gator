import { registerCommand, runCommand, handlerLogin, handlerRegister } from "./commands.js";

async function main() {
  const registry: { [key: string]: any } = {};

  registerCommand(registry, "login", handlerLogin);
  registerCommand(registry, "register", handlerRegister);

  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("not enough arguments");
    process.exit(1);
  }

  const cmdName = args[0];
  const cmdArgs = args.slice(1);

  try {
    await runCommand(registry, cmdName, ...cmdArgs);
  } catch (err: any) {
    console.log(err.message);
    process.exit(1);
  }

  process.exit(0);
}

main();
