import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { Readable } from "stream";
import { connectToDB } from "~/database/db";
import { chainIdToNetworkName } from "~/utils/chains";
import { Spinner } from "../Spinner/Spinner";
import { ObservedWallet } from "../Wallets/Observed/ObservedWallet";

export const fetchObservedWallets = server$(async function () {
  const db = await connectToDB(this.env);

  const cookie = this.cookie.get("accessToken")?.value;
  if (!cookie) {
    throw new Error("No cookie found");
  }
  const { userId } = jwt.decode(cookie) as JwtPayload;

  const observedWallets = (
    await db.query(`SELECT * FROM 
    (SELECT VALUE out FROM observes_wallet WHERE in = ${userId})`)
  ).at(0);

  return observedWallets;
});

export const observedWalletsLiveStream = server$(async function* () {
  const db = await connectToDB(this.env);

  const resultStream = new Readable({
    objectMode: true,
    read() { },
  });

  const cookie = this.cookie.get("accessToken")?.value;
  if (!cookie) {
    throw new Error("No cookie found");
  }
  const { userId } = jwt.decode(cookie) as JwtPayload;

  const [queryUuid]: any = await db.query(`LIVE SELECT * FROM wallet;`);

  await db.query(`
    INSERT INTO queryuuids (queryuuid,enabled) VALUES ('${queryUuid}',${true});
    `);

  const [queryUuidEnaledLive]: any = await db.query(
    `LIVE SELECT enabled FROM queryuuids WHERE queryuuid = '${queryUuid}';`,
  );

  yield queryUuid;

  const userObservedWallets = await fetchObservedWallets();
  yield userObservedWallets;

  await db.listenLive(queryUuidEnaledLive, ({ action }) => {
    if (action === "UPDATE") {
      resultStream.push(null);
      db.kill(queryUuidEnaledLive);
    }
  });

  try {
    await db.listenLive(queryUuid, async ({ action, result }) => {
      switch (action) {
        case "CLOSE":
          resultStream.push(null);
          break;
        case "DELETE":
          resultStream.push({ action, result });
          break;
        case "CREATE":
          const query = `SELECT * FROM observes_wallet WHERE in=${userId} AND out=${result.id};`;
          const [[response]]: any = await db.query(query);
          if (userId == response.in) {
            resultStream.push({ action, result });
          }
          break;
        default:
          resultStream.push({ action, result });
      }
    });
  } catch (err) {
    console.error("Error during db.listenLive", err);
  }

  for await (const result of resultStream) {
    if (!result) {
      break;
    }
    yield result;
  }

  await db.query(`DELETE FROM queryuuids WHERE queryuuid='${queryUuid}';`);
  return;
});

export const killLiveQuery = server$(async function (queryUuid: string) {
  const db = await connectToDB(this.env);
  await db.kill(queryUuid);
  await db.query(
    `UPDATE queryuuids SET enabled = ${false} WHERE queryuuid = '${queryUuid}'; `,
  );
});

export const fetchObservesWallet = server$(async function (out: any) {
  const db = await connectToDB(this.env);
  const cookie = this.cookie.get("accessToken")?.value;
  if (!cookie) {
    throw new Error("No cookie found");
  }
  const { userId } = jwt.decode(cookie) as JwtPayload;

  const res = await db.query(
    `SELECT * FROM observes_wallet where in = ${userId} and out=${out};`,
  );

  return res;
});

export const ObservedWalletsList = component$(() => {
  const usersObservedWallets = useSignal<any>([]);
  const isLoading = useSignal(true);
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async ({ cleanup }) => {
    cleanup(async () => {
      await killLiveQuery(queryUuid.value[0]);
    });
    const data = await observedWalletsLiveStream();
    const queryUuid = await data.next();
    usersObservedWallets.value = (await data.next()).value;
    isLoading.value = false;

    for await (const value of data) {
      if (value.action === "CREATE") {
        usersObservedWallets.value = [
          ...usersObservedWallets.value,
          value.result,
        ];
      }
      if (value.action === "DELETE") {
        usersObservedWallets.value = [
          ...usersObservedWallets.value.filter(
            (wallet: any) => wallet.id !== value.result.id,
          ),
        ];
      }
    }
  });

  return (
    <div class="">
      {isLoading.value ? ( // if loading --> display spinner
        <div class="flex flex-col items-center pt-12">
          <Spinner />
        </div>
      ) : !usersObservedWallets.value.length ? ( // if no wallets --> display message
        <div class="flex flex-col items-center pt-12">
          <span>No wallets added yet</span>
        </div>
      ) : (
        usersObservedWallets.value.map((observedWallet: any) => (
          <ObservedWallet
            key={observedWallet.address}
            observedWallet={observedWallet}
            chainIdToNetworkName={chainIdToNetworkName}
          />
        ))
      )}
    </div>
  );
});
