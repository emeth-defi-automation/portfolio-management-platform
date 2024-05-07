import { server$ } from "@builder.io/qwik-city";
import jwt, { type JwtPayload } from "jsonwebtoken";

export const getUserId = server$(async function () {
  const cookie = this.cookie.get("accessToken");
  if (!cookie) {
    throw new Error("No cookie found");
  }
  const { userId } = jwt.decode(cookie.value) as JwtPayload;

  return userId;
});
