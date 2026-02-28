import { setUser, readConfig } from "./config.js";
import { createUser, getUserByName, deleteAllUsers, getUsers } from "./lib/db/queries/users.js";
import { fetchFeed } from "./rss.js";
import { createFeed, getFeedsWithUsers, getFeedByUrl } from "./lib/db/queries/feeds.js";
import { createFeedFollow, getFeedFollowsForUser } from "./lib/db/queries/feedFollows.js";
import type { Feed, User } from "./lib/db/schema.js";

type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;
type UserCommandHandler = (cmdName: string, user: User, ...args: string[]) => Promise<void>;

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

export function middlewareLoggedIn(handler: UserCommandHandler): CommandHandler {
  return async (cmdName: string, ...args: string[]) => {
    const config = readConfig();
    const user = await getUserByName(config.currentUserName!);
    if (!user) {
      throw new Error("not logged in, please login first");
    }
    await handler(cmdName, user, ...args);
  };
}

export async function handlerLogin(cmdName: string, ...args: string[]) {
  if (args.length === 0) throw new Error("login requires a username");
  const username = args[0];
  const user = await getUserByName(username);
  if (!user) throw new Error(`user ${username} does not exist`);
  setUser(username);
  console.log(`logged in as ${username}`);
}

export async function handlerRegister(cmdName: string, ...args: string[]) {
  if (args.length === 0) throw new Error("register requires a username");
  const username = args[0];
  const existing = await getUserByName(username);
  if (existing) throw new Error(`user ${username} already exists`);
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

export async function handlerAgg(cmdName: string, ...args: string[]) {
  const feed = await fetchFeed("https://www.wagslane.dev/index.xml");
  console.log(JSON.stringify(feed, null, 2));
}

export async function handlerAddFeed(cmdName: string, user: User, ...args: string[]) {
  if (args.length < 2) throw new Error("addfeed requires a name and a url");
  const [name, url] = args;
  const feed = await createFeed(name, url, user.id);
  const follow = await createFeedFollow(user.id, feed.id);
  console.log(`name: ${follow.feedName}`);
  console.log(`user: ${follow.userName}`);
}

export async function handlerFeeds(cmdName: string, ...args: string[]) {
  const feedsWithUsers = await getFeedsWithUsers();
  for (const f of feedsWithUsers) {
    console.log(`name: ${f.feedName}`);
    console.log(`url: ${f.feedUrl}`);
    console.log(`user: ${f.userName}`);
    console.log("---");
  }
}

export async function handlerFollow(cmdName: string, user: User, ...args: string[]) {
  if (args.length === 0) throw new Error("follow requires a url");
  const url = args[0];
  const feed = await getFeedByUrl(url);
  if (!feed) throw new Error(`feed not found: ${url}`);
  const follow = await createFeedFollow(user.id, feed.id);
  console.log(`name: ${follow.feedName}`);
  console.log(`user: ${follow.userName}`);
}

export async function handlerFollowing(cmdName: string, user: User, ...args: string[]) {
  const follows = await getFeedFollowsForUser(user.id);
  for (const f of follows) {
    console.log(`* ${f.feedName}`);
  }
}
