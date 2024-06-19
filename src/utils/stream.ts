import { server$ } from "@builder.io/qwik-city";
import Moralis from "moralis";

export const setupStream = server$(async function () {
  const moralisApiKey = this.env.get("MORALIS_API_KEY");

  if (!moralisApiKey) {
    console.error("MORALIS_API_KEY is not set in the environment variables.");
    return;
  }

  if (!Moralis.Core.isStarted) {
    await Moralis.start({ apiKey: moralisApiKey });
  }
});
