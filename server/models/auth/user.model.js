import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password"),
  provider: text("provider").notNull().default("local"),
  providerId: text("provider_id").unique(),

  // Profile fields
  displayName: text("display_name"),
  bio: text("bio"),
  location: text("location"),
  status: text("status"),

  // Avatar
  avatarUrl: text("avatar_url"),
  avatarPublicId: text("avatar_public_id"), // Cloudinary public_id for deletion

  // Social links
  githubUrl: text("github_url"),
  twitterUrl: text("twitter_url"),
  linkedinUrl: text("linkedin_url"),
  websiteUrl: text("website_url"),

  emailVerified: boolean("email_verified").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});