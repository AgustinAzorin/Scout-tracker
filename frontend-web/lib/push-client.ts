export async function registerWebPush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
  const registration = await navigator.serviceWorker.register("/sw.js");
  await registration.pushManager.getSubscription();
}