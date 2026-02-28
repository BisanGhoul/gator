import { db } from "..";
import { feedFollows, feeds, users } from "../schema";
import { eq } from "drizzle-orm";

export async function createFeedFollow(userId: string, feedId: string) {
  const [result] = await db.insert(feedFollows).values({ userId, feedId }).returning();
  const [follow] = await db
    .select({ id: feedFollows.id, userId: feedFollows.userId, feedId: feedFollows.feedId, feedName: feeds.name, userName: users.name })
    .from(feedFollows)
    .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
    .innerJoin(users, eq(feedFollows.userId, users.id))
    .where(eq(feedFollows.id, result.id));
  return follow;
}

export async function getFeedFollowsForUser(userId: string) {
  return await db
    .select({ feedName: feeds.name, userName: users.name })
    .from(feedFollows)
    .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
    .innerJoin(users, eq(feedFollows.userId, users.id))
    .where(eq(feedFollows.userId, userId));
}
