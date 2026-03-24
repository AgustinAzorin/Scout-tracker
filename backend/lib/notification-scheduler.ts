import cron from "node-cron";

export async function checkAndSendNotifications(): Promise<void> {
  return;
}

export function startNotificationScheduler() {
  cron.schedule("* * * * *", async () => {
    await checkAndSendNotifications();
  });
}