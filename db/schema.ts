import { text } from "drizzle-orm/sqlite-core";
import { sqliteTable } from "drizzle-orm/sqlite-core";

export const sessions = sqliteTable("sessions", {
  code: text("code").primaryKey(),
  state: text("state").notNull(),
  updatedAt: text("updated_at").notNull(),
});
