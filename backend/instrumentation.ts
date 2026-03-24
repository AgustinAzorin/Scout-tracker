export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startSyncScheduler } = await import("./lib/sheets-sync");
    const { startNotificationScheduler } = await import("./lib/notification-scheduler");
    startSyncScheduler();
    startNotificationScheduler();
  }
}