import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
import { connectToDB } from "~/database/db";
import jwt, { type JwtPayload } from "jsonwebtoken";
import {
  fetchTokenDayData,
  getDBTokenPriceUSD,
  getDBTokensAddresses,
  getTokenImagePath,
} from "~/interface/wallets/observedWallets";
import { checksumAddress } from "viem";
import { type WalletTokensBalances } from "~/interface/walletsTokensBalances/walletsTokensBalances";
import { type Wallet } from "~/interface/auth/Wallet";
import { testPublicClient } from "~/routes/app/wallets/testconfig";
import { type Token } from "~/interface/token/Token";
import { contractABI } from "~/abi/abi";
import { convertWeiToQuantity } from "~/utils/formatBalances/formatTokenBalance";
import { type Balance } from "~/interface/balance/Balance";
import { chainIdToNetworkName } from "~/utils/chains";
import { Spinner } from "../Spinner/Spinner";
import { z } from "@builder.io/qwik-city";
import { Readable } from "stream";
import { ObsWallet } from "../Wallets/Observed/ObsWallet";

export const getObservedWallets = server$(async function () {
  const db = await connectToDB(this.env);

  const cookie = this.cookie.get("accessToken");
  if (!cookie) {
    throw new Error("No cookie found");
  }
  const { userId } = jwt.decode(cookie.value) as JwtPayload;

  const uniswapSubgraphURL = this.env.get("UNIV3_OPTIMIST_SUBGRAPH_URL");
  if (!uniswapSubgraphURL) {
    throw new Error("Missing UNISWAP_SUBGRAPH_URL");
  }
  const dbTokensAddresses = await getDBTokensAddresses(db);
  const tokenAddresses = dbTokensAddresses.map((token) =>
    token.address.toLowerCase(),
  );

  const tokenDayData = await fetchTokenDayData(
    uniswapSubgraphURL,
    tokenAddresses,
  );
  for (const {
    token: { id },
    priceUSD,
  } of tokenDayData) {
    await db.query(`
      UPDATE token
      SET priceUSD = '${priceUSD}'
      WHERE address = '${checksumAddress(id as `0x${string}`)}';
    `);
  }
  const UserObservedWalletsResult = z.object({
    name: z.string(),
    out: z.string(),
  });
  type UserObservedWalletsResult = z.infer<typeof UserObservedWalletsResult>;
  const result = (
    await db.query(`SELECT out, name FROM ${userId}->observes_wallet;`)
  ).at(0);
  if (!result) return [];
  const observedWalletsQueryResult =
    UserObservedWalletsResult.array().parse(result);
  const observedWallets: WalletTokensBalances[] = [];
  for (const observedWallet of observedWalletsQueryResult) {
    const [wallet] = await db.select<Wallet>(`${observedWallet.out}`);
    const nativeBalance = await testPublicClient.getBalance({
      address: wallet.address as `0x${string}`,
    });
    await db.query(
      `UPDATE ${observedWallet.out} SET nativeBalance = '${nativeBalance}';`,
    );
    const walletTokensBalances: WalletTokensBalances = {
      wallet: {
        id: wallet.id,
        name: observedWallet.name,
        chainId: wallet.chainId,
        address: wallet.address,
        nativeBalance: nativeBalance.toString(),
        isExecutable: wallet.isExecutable,
      },
      tokens: [],
    };
    // For each token update balance
    const tokens = await db.select<Token>("token");
    for (const token of tokens) {
      const readBalance = await testPublicClient.readContract({
        address: token.address as `0x${string}`,
        abi: contractABI,
        functionName: "balanceOf",
        args: [wallet.address as `0x${string}`],
      });

      const emethContractAddress = this.env.get(
        "PUBLIC_EMETH_CONTRACT_ADDRESS_SEPOLIA",
      );
      if (!emethContractAddress) {
        throw new Error("Missing PUBLIC_EMETH_CONTRACT_ADDRESS_SEPOLIA");
      }

      const allowance = await testPublicClient.readContract({
        account: wallet.address as `0x${string}`,
        address: checksumAddress(token.address as `0x${string}`),
        abi: contractABI,
        functionName: "allowance",
        args: [
          wallet.address as `0x${string}`,
          emethContractAddress as `0x${string}`,
        ],
      });

      const formattedAllowance = convertWeiToQuantity(
        allowance.toString(),
        token.decimals,
      );

      // Certain balance which shall be updated
      const [[balanceToUpdate]]: any = await db.query(
        `SELECT * FROM balance WHERE ->(for_wallet WHERE out = '${wallet.id}') AND ->(for_token WHERE out = '${token.id}');`,
      );

      await db.update<Balance>(`${balanceToUpdate.id}`, {
        value: readBalance.toString(),
      });

      const formattedBalance = convertWeiToQuantity(
        readBalance.toString(),
        token.decimals,
      );

      if (readBalance !== BigInt(0) && formattedBalance !== "0.000") {
        // Add the token to the wallet object
        const [{ priceUSD }] = await getDBTokenPriceUSD(db, token.address);
        const [imagePath] = await getTokenImagePath(db, token.symbol);

        walletTokensBalances.tokens.push({
          id: token.id,
          address: token.address,
          name: token.name,
          symbol: token.symbol,
          decimals: token.decimals,
          balance: formattedBalance,
          imagePath: imagePath.imagePath,
          allowance: formattedAllowance,
          balanceValueUSD: (
            Number(formattedBalance) * Number(priceUSD)
          ).toFixed(2),
        });
      }
    }
    observedWallets.push(walletTokensBalances);
  }
  return observedWallets;
});

export const FetchObservedWalletsResult = z.array(
  z.object({
    address: z.string(),
    chainId: z.number(),
    id: z.string(),
    isExecutable: z.boolean(),
    nativeBalance: z.string(),
  }),
);

export type FetchObservedWalletsResult = z.infer<
  typeof FetchObservedWalletsResult
>;

export const fetchObservedWallets = server$(async function () {
  const db = await connectToDB(this.env);
  const cookie = this.cookie.get("accessToken")?.value;
  if (!cookie) {
    throw new Error("No cookie found");
  }
  const { userId } = jwt.decode(cookie) as JwtPayload;
  const observedWallets = (
    await db.query(`SELECT * FROM  
  (SELECT VALUE out FROM observes_wallet WHERE in = ${userId});`)
  ).at(0);

  console.log(
    "observedWallets from fetchobservedwallets",
    FetchObservedWalletsResult.parse(observedWallets),
  );
  return FetchObservedWalletsResult.parse(observedWallets);
});

export const observedWalletsLiveStream = server$(async function* () {
  const db = await connectToDB(this.env);

  const resultsStream = new Readable({
    objectMode: true,
    read() {},
  });
  const cookie = this.cookie.get("accessToken")?.value;
  if (!cookie) {
    throw new Error("No cookie found");
  }
  const { userId } = jwt.decode(cookie) as JwtPayload;
  console.log("userId", userId);
  const queryUuid: any = await db.query(`LIVE SELECT * FROM wallet WHERE
  (SELECT VALUE out FROM observes_wallet where in = ${userId});`);
  // const queryUuid: any = await db.query(`LIVE SELECT * FROM wallet`);
  await db.query(
    `INSERT INTO queryuuids (queryUuid, enabled) VALUES ('${queryUuid}', ${true});`,
  );
  console.log("instered queryUuid", queryUuid[0], true);
  yield queryUuid;

  const walletsObservedByLoggedInUser = await fetchObservedWallets();
  yield walletsObservedByLoggedInUser;

  const queryUuidEnabledLive: any = await db.query(
    `LIVE SELECT enabled FROM queryuuids WHERE queryUuid = '${queryUuid[0]}';`,
  );

  await db.listenLive(queryUuidEnabledLive[0], ({ action, result }) => {
    if (action === "UPDATE") {
      console.log("result", result);
      console.log("pushing null to resultStream");
      resultsStream.push(null);
      db.kill(queryUuidEnabledLive[0]);
    }
  });

  try {
    await db.listenLive(
      queryUuid[0],
      // The callback function takes an object with the "action" and "result" properties
      ({ action, result }) => {
        if (action === "CLOSE") {
          resultsStream.push(null);
          return;
        }
        resultsStream.push({ action, result });
      },
    );
  } catch (error) {
    console.error("Error during db.listenLive:", error);
  }

  for await (const result of resultsStream) {
    if (!result) {
      console.log("result is NULL");
      break;
    }
    console.log("result", result);
    yield result;
  }
  console.log("exit async for");
  await db.query(`DELETE FROM queryuuids WHERE queryUuid = '${queryUuid[0]}';`);
  return;
});

export const killLiveQuery = server$(async function (queryUuid: string) {
  const db = await connectToDB(this.env);
  console.log("killing live query", queryUuid[0]);
  await db.kill(queryUuid[0]);
  const dataAfterUpdate = await db.query(
    `UPDATE queryuuids SET enabled = ${false} WHERE queryUuid = '${queryUuid[0]}';`,
  );
  console.log("dataAfterUpdate", dataAfterUpdate);
});

export const ObservedWalletsList = component$(() => {
  const walletsObservedByLoggedInUser = useSignal<Wallet[]>([]);
  const isLoading = useSignal(true);
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async ({ cleanup }) => {
    const data = await observedWalletsLiveStream();
    cleanup(async () => {
      console.log("cleanup starts ObservedWalletsList", queryUuid.value);
      await killLiveQuery(queryUuid.value);
    });

    const queryUuid = await data.next();
    console.log("queryUuid", queryUuid);

    walletsObservedByLoggedInUser.value = (await data.next()).value;
    isLoading.value = false;

    console.log(
      "walletsObservedByLoggedInUser",
      walletsObservedByLoggedInUser.value,
    );

    for await (const value of data) {
      console.log("value", value);
      if (value.action === "CREATE") {
        console.log("create", value.action);
        walletsObservedByLoggedInUser.value = [
          ...walletsObservedByLoggedInUser.value,
          value.result,
        ];
      }
      if (value.action === "DELETE") {
        console.log("delete", value.action);
        walletsObservedByLoggedInUser.value = [
          ...walletsObservedByLoggedInUser.value.filter(
            (wallet) => wallet.id !== value.result.id,
          ),
        ];
      }

      console.log(
        "walletsObservedByLoggedInUser after add/delete",
        walletsObservedByLoggedInUser.value,
      );
    }
    console.log("EXIT ASYNC FOR IN VISIBEL TASK");
  });

  return (
    <div class="">
      {isLoading.value ? (
        <div class="flex flex-col items-center pt-12">
          <Spinner />
        </div>
      ) : walletsObservedByLoggedInUser.value.length === 0 ? (
        <div class="flex flex-col items-center pt-12">
          <span>No wallets added yet</span>
        </div>
      ) : (
        // observedWallets.value.map((observedWallet) => (
        //   <ObservedWallet
        //     key={observedWallet.wallet.address}
        //     observedWallet={observedWallet}
        //     selectedWallet={selectedWallet}
        //     chainIdToNetworkName={chainIdToNetworkName}
        //   />
        // ))
        walletsObservedByLoggedInUser.value.map((wallet) => (
          <ObsWallet
            observedWallet={wallet}
            key={wallet.id}
            chainIdToNetworkName={chainIdToNetworkName}
          />
        ))
      )}
    </div>
  );
});
