import { varchar, mysqlTable, mysqlEnum } from "drizzle-orm/mysql-core";
import { Users } from "./users";
import { relations } from "drizzle-orm";

export const Settings = mysqlTable("setting", {
  userId: varchar("userId", { length: 36 }) // Ensure this matches the type in users
    .notNull()
    .unique()
    .references(() => Users.id, { onDelete: "cascade" }) // Foreign key referencing user ID
    .primaryKey(),
  theme: mysqlEnum("theme", ["white", "black"]).default("white").notNull(), // Theme preference
  language: mysqlEnum("language", ["lo", "en"]).default("lo").notNull(), // Language preference
});

// Setting Relationship: One-to-One belongs to user
export const profileInfoRelations = relations(Settings, ({ one }) => ({
  user: one(Users, { fields: [Settings.userId], references: [Users.id] }),
}));
