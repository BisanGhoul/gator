import { setUser } from "./config.js";

type CommandHandler = (cmdName: string, ...args: string[]) => void;

type CommandsRegistry = {
  [key: string]: CommandHandler;
};

export function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler) {
  registry[cmdName] = handler;
}

export function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]) {
  const handler = registry[cmdName];
  if (!handler) {
    throw new Error(`unknown command: ${cmdName}`);
  }
  handler(cmdName, ...args);
}

export function handlerLogin(cmdName: string, ...args: string[]) {
  if (args.length === 0) {
    throw new Error("login requires a username");
  }
  const username = args[0];
  setUser(username);
  console.log(`user set to: ${username}`);
}
