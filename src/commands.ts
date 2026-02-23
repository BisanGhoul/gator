import { setUser } from "./config.js";
import { createUser, getUserByName, deleteAllUsers } from "./lib/db/queries/users.js";

type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;

type CommandsRegistry = {
  [key: string]: CommandHandler;
};

export function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler) {
  registry[cmdName] = handler;
}

export async function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]) {
  const handler = registry[cmdName];
  if (!handler) {
    throw new Error(`unknown command: ${cmdName}`);
  }
  await handler(cmdName, ...args);
}

export async function handlerLogin(cmdName: string, ...args: string[]) {
  if (args.length === 0) {
    throw new Error("login requires a username");
  }
  const username = args[0];
  const user = await getUserByName(username);
  if (!user) {
    throw new Error(`user ${username} does not exist`);
  }
  setUser(username);
  console.log(`logged in as ${username}`);
}

export async function handlerRegister(cmdName: string, ...args: string[]) {
  if (args.length === 0) {
    throw new Error("register requires a username");
  }
  const username = args[0];
  const existing = await getUserByName(username);
  if (existing) {
    throw new Error(`user ${username} already exists`);
  }
  const user = await createUser(username);
  setUser(username);
  console.log(`user created!`);
  console.log(user);
}

export async function handlerReset(cmdName: string, ...args: string[]) {
  await deleteAllUsers();
  console.log("database reset!");
}
