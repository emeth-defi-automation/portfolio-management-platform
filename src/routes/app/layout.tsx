import {
  Slot,
  component$,
  createContextId,
  useContext,
  useContextProvider,
  useStore,
} from "@builder.io/qwik";
import { type RequestHandler } from "@builder.io/qwik-city";
import jwt from "jsonwebtoken";
import { Message } from "~/components/Message/Message";
import { Navbar } from "~/components/Navbar/Navbar";
import { NavbarContent } from "~/components/Navbar/NavbarContent";

export const onRequest: RequestHandler = ({ redirect, cookie, env }) => {
  const accessToken = cookie.get("accessToken");
  if (!accessToken) {
    throw redirect(307, "/?sessionExpired=true");
  }
  const secret = env.get("ACCESS_TOKEN_SECRET");
  if (!secret) throw new Error("No secret");
  try {
    jwt.verify(accessToken.value, secret);
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw redirect(307, "/?sessionExpired=true");
    }
    throw err;
  }
};
interface Message {
  variant: "info" | "success" | "error";
  message: string;
  isVisible: boolean;
  id: number;
  time?: number;
}
interface MessagesStore {
  messages: Message[];
}

export const messagesContext = createContextId<MessagesStore>("Messages");

export default component$(() => {
  useContextProvider(
    messagesContext,
    useStore<MessagesStore>({
      messages: [],
    }),
  );
  const messagesProvider = useContext(messagesContext);
  return (
    <>
      <div class="scrollbar relative z-0 grid h-screen grid-rows-[auto_1fr] overflow-x-hidden bg-black font-['Sora']">
        <div class="gradient absolute left-1/4 top-0 h-1/5 w-6/12 rounded-full"></div>
        <Navbar>
          <NavbarContent />
        </Navbar>
        <Slot />
        <div class="gradient absolute bottom-0 left-1/4 h-1/5 w-6/12 rounded-full"></div>
        <div
          class={`fixed bottom-8 left-full flex h-full flex-col justify-end gap-4`}
        >
          {messagesProvider.messages.map((item, key) => (
            <Message
              id={item.id}
              key={key}
              variant={item.variant}
              message={item.message}
              isVisible={item.isVisible}
              time={item.time ? item.time : undefined}
            />
          ))}
        </div>
      </div>
    </>
  );
});
