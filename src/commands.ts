import { setUser, readConfig } from "./config.js";
import { createUser, getUserByName, deleteAllUsers, getUsers } from "./lib/db/queries/users.js";

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

export async function handlerUsers(cmdName: string, ...args: string[]) {
  const config = readConfig();
  const allUsers = await getUsers();
  for (const user of allUsers) {
    if (user.name === config.currentUserName) {
      console.log(`* ${user.name} (current)`);
    } else {
      console.log(`* ${user.name}`);
    }
  }
}

import { fetchFeed } from "./rss.js";

export async function handlerAgg(cmdName: string, ...args: string[]) {
  const feed = await fetchFeed("https://www.wagslane.dev/index.xml");
  console.log(JSON.stringify(feed, null, 2));
}

import { createFeed } from "./lib/db/queries/feeds.js";
import type { Feed, User } from "./lib/db/schema.js";

function printFeed(feed: Feed, user: User) {
  console.log(`id: ${feed.id}`);
  console.log(`name: ${feed.name}`);
  console.log(`url: ${feed.url}`);
  console.log(`user: ${user.name}`);
}

export async function handlerAddFeed(cmdName: string, ...args: string[]) {
  if (args.length < 2) {
    throw new Error("addfeed requires a name and a url");
  }
  const config = readConfig();
  const user = await getUserByName(config.currentUserName!);
  if (!user) {
    throw new Error("current user not found, please login first");
  }
  const [name, url] = args;
  const feed = await createFeed(name, url, user.id);
  printFeed(feed, user);
}
