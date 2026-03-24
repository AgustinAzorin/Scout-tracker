import * as Notifications from "expo-notifications";

export async function registerMobilePush() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") return null;
  const token = await Notifications.getExpoPushTokenAsync();
  return token.data;
}