import { Hono } from "hono";
import { eq, and, desc } from "drizzle-orm";

import { db, sql_client } from "@/db";
import { notifications } from "@/db/schema";
import { sessionMiddleware } from "@/lib/session-middleware";

// Notification management endpoints
const app = new Hono()
  // Get user's notifications
  .get("/", sessionMiddleware, async (c) => {
    try {
      const user = c.get("user");
      console.log('[Get Notifications] Fetching for user:', user.id);

      const userNotifications = await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, user.id))
        .orderBy(desc(notifications.createdAt))
        .limit(50);

      console.log('[Get Notifications] Found', userNotifications.length, 'notifications');
      return c.json({ success: true, data: userNotifications });
    } catch (error) {
      console.error("[Get Notifications] Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return c.json(
        { success: false, error: "Failed to fetch notifications", details: errorMessage },
        500
      );
    }
  })

  // Mark notification as read
  .patch("/:notificationId/read", sessionMiddleware, async (c) => {
    try {
      const user = c.get("user");
      const { notificationId } = c.req.param();
      console.log('[Mark Read] User:', user.id, 'Notification:', notificationId);

      await db
        .update(notifications)
        .set({
          isRead: "true",
          readAt: new Date(),
        })
        .where(
          and(
            eq(notifications.id, notificationId),
            eq(notifications.userId, user.id) // Security: only user's own notifications
          )
        );

      console.log('[Mark Read] Successfully marked as read');
      return c.json({ success: true, message: "Notification marked as read" });
    } catch (error) {
      console.error("[Mark Read] Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return c.json(
        { success: false, error: "Failed to update notification", details: errorMessage },
        500
      );
    }
  })

  //Mark all notifications as read
  .patch("/mark-all-read", sessionMiddleware, async (c) => {
    try {
      const user = c.get("user");
      if (!user?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }
      
      // Use raw SQL to avoid Drizzle proxy objects
      await sql_client`
        UPDATE notifications 
        SET is_read = 'true', read_at = NOW() 
        WHERE user_id = ${user.id} AND is_read = 'false'
      `;
      
      return c.json({ success: true, message: "All notifications marked as read" });
    } catch (error) {
      console.error('[Mark All Read] Error:', error);
      return c.json({ success: false, error: "Failed to mark notifications as read" }, 500);
    }
  })

  // Clear all notifications (MUST come before /:notificationId)
  .delete("/clear-all", sessionMiddleware, async (c) => {
    try {
      const user = c.get("user");
      
      if (!user?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      // Use raw SQL to avoid Drizzle proxy objects
      await sql_client`DELETE FROM notifications WHERE user_id = ${user.id}`;

      return c.json({ success: true, message: "All notifications cleared" });
    } catch (error) {
      console.error("[Clear All Notifications] Error:", error);
      return c.json({ success: false, error: "Failed to clear notifications" }, 500);
    }
  })

  // Delete individual notification
  .delete("/:notificationId", sessionMiddleware, async (c) => {
    try {
      const user = c.get("user");
      
      if (!user?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }
      
      const { notificationId } = c.req.param();

      // Use raw SQL to avoid Drizzle proxy objects
      await sql_client`
        DELETE FROM notifications 
        WHERE id = ${notificationId} AND user_id = ${user.id}
      `;
      
      return c.json({ success: true, message: "Notification deleted" });
    } catch (error) {
      console.error("[Delete Notification] Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return c.json(
        { success: false, error: "Failed to delete notification", details: errorMessage },
        500
      );
    }
  });

export default app;
