import { TriggerClient } from "@trigger.dev/sdk";

export const client = new TriggerClient({
  id: "openldr-dashboard-e1sY",
  apiKey: process.env.TRIGGER_API_KEY,
  apiUrl: process.env.TRIGGER_API_URL,
});
