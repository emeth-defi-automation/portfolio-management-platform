import {
  component$,
  type Signal,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
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
import { ObservedWallet } from "../Wallets/Observed/ObservedWallet";
import { type Balance } from "~/interface/balance/Balance";
import { chainIdToNetworkName } from "~/utils/chains";
import { Spinner } from "../Spinner/Spinner";
import { z } from "@builder.io/qwik-city";

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

interface ObservedWalletsListProps {
  selectedWallet: Signal<WalletTokensBalances | null>;
  observedWallets: Signal<WalletTokensBalances[]>;
}

export const ObservedWalletsList = component$<ObservedWalletsListProps>(
  ({ selectedWallet, observedWallets }) => {
    const isLoading = useSignal(true);
    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(async () => {
      observedWallets.value = await getObservedWallets();
      isLoading.value = false;
    });

    return (
      <div class="">
        {isLoading.value ? ( // if loading --> display spinner
          <div class="flex flex-col items-center pt-12">
            <Spinner />
          </div>
        ) : observedWallets.value.length === 0 ? ( // if no wallets --> display message
          <div class="flex flex-col items-center pt-12">
            <span>No wallets added yet</span>
          </div>
        ) : (
          observedWallets.value.map((observedWallet) => (
            <ObservedWallet
              key={observedWallet.wallet.address}
              observedWallet={observedWallet}
              selectedWallet={selectedWallet}
              chainIdToNetworkName={chainIdToNetworkName}
            />
          ))
        )}
      </div>
    );
  },
);
