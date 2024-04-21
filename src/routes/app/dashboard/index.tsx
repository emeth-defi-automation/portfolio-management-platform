import {
  $,
  component$,
  useSignal,
  useStore,
  useTask$,
  useVisibleTask$,
} from "@builder.io/qwik";
import { PortfolioValue } from "~/components/PortfolioValue/PortfolioValue";
import { ActionAlertMessage } from "~/components/ActionAlertsMessage/ActionAlertsMessage";
import {
  SuccessStatus,
  WarningStatus,
} from "~/components/ActionAlertsMessage/ActionStatus";
import { TokenRow } from "~/components/Tokens/TokenRow";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { connectToDB } from "~/utils/db";
import {
  routeAction$,
  routeLoader$,
  server$,
  useNavigate,
} from "@builder.io/qwik-city";
import {
  fetchTokenDayData,
  getDBTokenPriceUSD,
  getDBTokensAddresses,
  getTokenImagePath,
} from "~/interface/wallets/observedWallets";
import { checksumAddress } from "viem";
import { type Wallet } from "~/interface/auth/Wallet";
import {
  convertWeiToQuantity,
  getPercentageOfTotalValueChange,
  getProperTotalValueChange,
} from "~/utils/formatBalances/formatTokenBalance";
import { chainIdToNetworkName } from "~/utils/chains";
import { type Balance, type PeriodState } from "~/interface/balance/Balance";
import { type Token } from "~/interface/token/Token";
import { testPublicClient } from "../wallets/testconfig";
import { contractABI } from "~/abi/abi";
import Moralis from "moralis";
import {
  generateTimestamps,
  getSelectedPeriodInHours,
  getSelectedPeriodKey,
} from "~/utils/timestamps/timestamp";
import { EvmChain } from "@moralisweb3/common-evm-utils";
import { Spinner } from "~/components/Spinner/Spinner";

function mapTokenAddress(sepoliaAddress: string): any {
  const tokenMap: any = {
    "0x054E1324CF61fe915cca47C48625C07400F1B587":
      "0x7DD9c5Cba05E151C895FDe1CF355C9A1D5DA6429",
    "0xD418937d10c9CeC9d20736b2701E506867fFD85f":
      "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    "0x9D16475f4d36dD8FC5fE41F74c9F44c7EcCd0709":
      "0xdac17f958d2ee523a2206206994597c13d831ec7",
  };
  if (sepoliaAddress in tokenMap) {
    return tokenMap[sepoliaAddress];
  } else {
    return null;
  }
}
export const useToggleChart = routeAction$(async (data, requestEvent) => {
  console.log("useToggleChart started");

  const selectedPeriod: { period: number; interval: number } =
    getSelectedPeriodInHours(data as PeriodState);
  const db = await connectToDB(requestEvent.env);

  const cookie = requestEvent.cookie.get("accessToken");
  if (!cookie) {
    throw new Error("No cookie found");
  }
  const { userId } = jwt.decode(cookie.value) as JwtPayload;

  const [result]: any = await db.query(
    `SELECT VALUE ->observes_wallet.out FROM ${userId};`,
  );
  if (!result) throw new Error("No observed wallets");
  const observedWalletsQueryResult = result[0];

  const dashboardBalance: { tokenAddress: string; balance: string }[] = [];
  const ethBlocks = [];
  const sepBlocks = [];
  const chartTimestamps = generateTimestamps(
    selectedPeriod.period,
    selectedPeriod.interval,
  );
  const chartData: number[] = new Array(chartTimestamps.length).fill(0);

  for (const item of chartTimestamps) {
    try {
      const blockDetails = await Moralis.EvmApi.block.getDateToBlock({
        chain: EvmChain.ETHEREUM.hex,
        date: item,
      });
      ethBlocks.push(blockDetails.raw.block);

      const sepoliaBlockDetails = await Moralis.EvmApi.block.getDateToBlock({
        chain: EvmChain.SEPOLIA.hex,
        date: item,
      });
      sepBlocks.push(sepoliaBlockDetails.raw.block);
    } catch (error) {
      console.error(error);
    }
  }

  for (const observedWallet of observedWalletsQueryResult) {
    const [wallet] = await db.select<Wallet>(`${observedWallet}`);

    // For each token update balance
    const tokens = await db.select<Token>("token");
    for (const token of tokens) {
      const readBalance = await testPublicClient.readContract({
        address: token.address as `0x${string}`,
        abi: contractABI,
        functionName: "balanceOf",
        args: [wallet.address as `0x${string}`],
      });

      const formattedBalance = convertWeiToQuantity(
        readBalance.toString(),
        token.decimals,
      );

      if (readBalance !== BigInt(0) && formattedBalance !== "0.000") {
        dashboardBalance.push({
          tokenAddress: token.address,
          balance: formattedBalance,
        });
      }
    }

    let combinedQuery: string = "";
    for (let i = 0; i < chartTimestamps.length; i++) {
      const walletBalanceQuery = `
        SELECT blockNumber, timestamp, 0x9d16475f4d36dd8fc5fe41f74c9f44c7eccd0709, 0xd418937d10c9cec9d20736b2701e506867ffd85f, 0x054e1324cf61fe915cca47c48625c07400f1b587
        FROM wallet_balance
        WHERE '${chartTimestamps[i]}' >= timestamp
          AND wallwalletAddress = ${wallet.address}
        ORDER BY timestamp DESC
          LIMIT 1;
      `;
      combinedQuery += walletBalanceQuery;
    }
    const walletBalanceAtTimestamp: any = await db.query(combinedQuery);

    try {
      for (let i = 0; i < chartTimestamps.length; i++) {
        try {
          let partBalance: number = 0;

          for (const balanceEntry of dashboardBalance) {
            const ethTokenAddress = mapTokenAddress(balanceEntry.tokenAddress);
            const tokenPrice = await Moralis.EvmApi.token.getTokenPrice({
              chain: EvmChain.ETHEREUM.hex,
              toBlock: ethBlocks[i],
              address: ethTokenAddress,
            });

            if (walletBalanceAtTimestamp[i].length > 0) {
              partBalance +=
                parseFloat(
                  walletBalanceAtTimestamp[i][0][
                    balanceEntry.tokenAddress.toLowerCase()
                  ],
                ) * tokenPrice.raw.usdPrice;
            } else {
              partBalance += 0;
            }
          }
          chartData[i] += partBalance;
        } catch (error) {
          console.error(error);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  let totalValueChange = 0;

  if (chartData.length >= 2) {
    totalValueChange = getProperTotalValueChange(
      chartData[0],
      chartData[chartData.length - 1],
    );
  }

  let percentageOfTotalValueChange = 0;

  if (chartData.length >= 2) {
    percentageOfTotalValueChange = getPercentageOfTotalValueChange(
      chartData[0],
      totalValueChange,
    );
  }
  console.log("chartData", chartData);
  return {
    percentageOfTotalValueChange: percentageOfTotalValueChange.toFixed(2) + "%",
    totalValueChange: totalValueChange.toFixed(2),
    period: getSelectedPeriodKey(data as PeriodState),
    chartData: chartData.map((value, index) => [
      chartTimestamps[index],
      parseFloat(value.toFixed(2)),
    ]) as [string, number][],
  };
});

export const getPortfolio24hChange = server$(async function () {
  const db = await connectToDB(this.env);

  const cookie = this.cookie.get("accessToken");
  if (!cookie) {
    throw new Error("No cookie found");
  }
  const { userId } = jwt.decode(cookie.value) as JwtPayload;

  const [result]: any = await db.query(
    `SELECT VALUE ->observes_wallet.out FROM ${userId};`,
  );
  if (!result) throw new Error("No observed wallets");

  const observedWalletsQueryResult = result[0];
  const dashboardBalance: { tokenAddress: string; balance: string }[] = [];
  const ethBlocks = [];
  const sepBlocks = [];
  const chartTimestamps = generateTimestamps(24, 4);
  const chartData: number[] = new Array(chartTimestamps.length).fill(0);

  for (const item of chartTimestamps) {
    try {
      const blockDetails = await Moralis.EvmApi.block.getDateToBlock({
        chain: EvmChain.ETHEREUM.hex,
        date: item,
      });
      ethBlocks.push(blockDetails.raw.block);

      const sepoliaBlockDetails = await Moralis.EvmApi.block.getDateToBlock({
        chain: EvmChain.SEPOLIA.hex,
        date: item,
      });
      sepBlocks.push(sepoliaBlockDetails.raw.block);
    } catch (error) {
      console.error(error);
    }
  }
  for (const observedWallet of observedWalletsQueryResult) {
    const [wallet] = await db.select<Wallet>(`${observedWallet}`);

    // For each token update balance
    const tokens = await db.select<Token>("token");
    for (const token of tokens) {
      const readBalance = await testPublicClient.readContract({
        address: token.address as `0x${string}`,
        abi: contractABI,
        functionName: "balanceOf",
        args: [wallet.address as `0x${string}`],
      });

      const formattedBalance = convertWeiToQuantity(
        readBalance.toString(),
        token.decimals,
      );

      if (readBalance !== BigInt(0) && formattedBalance !== "0.000") {
        dashboardBalance.push({
          tokenAddress: token.address,
          balance: formattedBalance,
        });
      }
    }

    let combinedQuery: string = "";
    for (let i = 0; i < chartTimestamps.length; i++) {
      const walletBalanceQuery = `
        SELECT blockNumber, timestamp, 0x9d16475f4d36dd8fc5fe41f74c9f44c7eccd0709, 0xd418937d10c9cec9d20736b2701e506867ffd85f, 0x054e1324cf61fe915cca47c48625c07400f1b587
        FROM wallet_balance
        WHERE '${chartTimestamps[i]}' >= timestamp
          AND wallwalletAddress = ${wallet.address}
        ORDER BY timestamp DESC
          LIMIT 1;
      `;
      combinedQuery += walletBalanceQuery;
    }
    const walletBalanceAtTimestamp: any = await db.query(combinedQuery);

    try {
      for (let i = 0; i < chartTimestamps.length; i++) {
        try {
          let partBalance: number = 0;
          for (const balanceEntry of dashboardBalance) {
            const ethTokenAddress = mapTokenAddress(balanceEntry.tokenAddress);
            const tokenPrice = await Moralis.EvmApi.token.getTokenPrice({
              chain: EvmChain.ETHEREUM.hex,
              toBlock: ethBlocks[i],
              address: ethTokenAddress,
            });

            partBalance +=
              parseFloat(
                walletBalanceAtTimestamp[i][0][
                  balanceEntry.tokenAddress.toLowerCase()
                ],
              ) * tokenPrice.raw.usdPrice;
          }

          chartData[i] += partBalance;
        } catch (error) {
          console.error(error);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  let totalValueChange = 0;

  totalValueChange = getProperTotalValueChange(
    chartData[0],
    chartData[chartData.length - 1],
  );

  let percentageOfTotalValueChange = 0;

  percentageOfTotalValueChange = getPercentageOfTotalValueChange(
    chartData[0],
    totalValueChange,
  );

  return {
    percentageOfTotalValueChange: percentageOfTotalValueChange.toFixed(2) + "%",
    totalValueChange: totalValueChange.toFixed(2),
    period: "24h",
    chartData: chartData.map((value, index) => [
      chartTimestamps[index],
      parseFloat(value.toFixed(2)),
    ]) as [string, number][],
  };
});

export const getTotalPortfolioValue = server$(async function () {
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

  const [result]: any = await db.query(
    `SELECT ->observes_wallet.out FROM ${userId};`,
  );
  if (!result) throw new Error("No observed wallets");
  const observedWalletsQueryResult = result[0]["->observes_wallet"].out;

  let totalValue = 0;

  for (const observedWallet of observedWalletsQueryResult) {
    const [wallet] = await db.select<Wallet>(`${observedWallet}`);
    const nativeBalance = await testPublicClient.getBalance({
      address: wallet.address as `0x${string}`,
      blockTag: "safe",
    });
    await db.query(
      `UPDATE ${observedWallet} SET nativeBalance = '${nativeBalance}';`,
    );

    // For each token update balance
    const tokens = await db.select<Token>("token");
    for (const token of tokens) {
      const readBalance = await testPublicClient.readContract({
        address: token.address as `0x${string}`,
        abi: contractABI,
        functionName: "balanceOf",
        args: [wallet.address as `0x${string}`],
      });

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
        const balanceValueUSD = (
          Number(formattedBalance) * Number(priceUSD)
        ).toFixed(2);
        totalValue += Number(balanceValueUSD);
      }
    }
  }
  return totalValue.toFixed(2);
});

export const getFavouriteTokens = server$(async function () {
  const db = await connectToDB(this.env);

  const cookie = this.cookie.get("accessToken");
  if (!cookie) {
    throw new Error("No cookie found");
  }
  const { userId } = jwt.decode(cookie.value) as JwtPayload;
  const [result]: any = await db.query(
    `SELECT * FROM ${userId}->has_structure WHERE out.name = 'Favourite Tokens';`,
  );
  if (!result.length) return [];
  const createdStructure = result[0].out;
  const availableStructures: any[] = [];

  const [structure] = await db.select(`${createdStructure}`);
  const structureTokens: any = [];
  const [structureBalances]: any = await db.query(`
    SELECT ->structure_balance.out FROM ${structure.id}`);

  for (const balance of structureBalances[0]["->structure_balance"].out) {
    const [walletId]: any = await db.query(`
      SELECT out  FROM for_wallet WHERE in = ${balance}`);
    const [wallet] = await db.select<Wallet>(`${walletId[0].out}`);

    const [tokenBalance]: any = await db.query(`
      SELECT * FROM balance WHERE id=${balance}`);

    const [tokenId]: any = await db.query(`
      SELECT ->for_token.out FROM ${balance}`);

    const [token]: any = await db.query(
      `SELECT * FROM ${tokenId[0]["->for_token"].out[0]}`,
    );
    const [tokenValue] = await getDBTokenPriceUSD(db, token[0].address);
    const [imagePath] = await getTokenImagePath(db, token[0].symbol);
    const tokenWithBalance = {
      id: token[0].id,
      name: token[0].name,
      symbol: token[0].symbol,
      decimals: token[0].decimals,
      balance: tokenBalance[0].value,
      balanceValueUSD: tokenValue.priceUSD,
      imagePath: imagePath.imagePath,
    };

    structureTokens.push({
      wallet: {
        id: wallet.id,
        name: wallet.name,
        chainId: wallet.chainId,
      },
      balance: tokenWithBalance,
    });
  }

  availableStructures.push({
    structure: {
      id: structure.id,
      name: structure.name,
    },
    structureBalance: structureTokens,
  });

  return availableStructures;
});

export default component$(() => {
  const nav = useNavigate();
  const isPortfolioFullScreen = useSignal(false);
  // const totalPortfolioValue = useTotalPortfolioValue();
  const totalPortfolioValue = useSignal("0");
  const totalPortfolioValueLoading = useSignal(true);

  // const portfolioValueChange = usePortfolio24hChange();
  const portfolioValueChange = useSignal<any>({});
  const portfolioValueChangeLoading = useSignal(true);

  // const favoriteTokens = useGetFavoriteTokens();
  const favoriteTokenLoading = useSignal(true);
  const favoriteTokens = useSignal<any[]>([]);
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    favoriteTokens.value = await getFavouriteTokens();
    favoriteTokenLoading.value = false;

    totalPortfolioValue.value = await getTotalPortfolioValue();
    totalPortfolioValueLoading.value = false;

    portfolioValueChange.value = await getPortfolio24hChange();
    portfolioValueChangeLoading.value = false;
  });

  const toggleChart = useToggleChart();

  // const chartDataStore = useStore({
  //   data: portfolioValueChange.value.chartData,
  // });

  // TODO: get rid of that?
  // const portfolioValueStore = useStore({
  //   selectedPeriodLabel: portfolioValueChange.value.period,
  //   portfolioValueChange: portfolioValueChange.value.totalValueChange,
  //   portfolioPercentageValueChange:
  //     portfolioValueChange.value.percentageOfTotalValueChange,
  // });
  const changePeriod = useSignal(false);
  const selectedPeriod: PeriodState = useStore({
    "24h": true,
    "1W": false,
    "1M": false,
    "1Y": false,
  });

  const togglePeriod = $(function togglePeriod(button: string) {
    for (const key in selectedPeriod) {
      selectedPeriod[key] = false;
    }
    selectedPeriod[button] = true;
  });

  useTask$(async ({ track }) => {
    track(async () => {
      console.log("use task started");
      selectedPeriod["24h"];
      selectedPeriod["1W"];
      selectedPeriod["1M"];
      selectedPeriod["1Y"];

      if (changePeriod.value !== false) {
        console.log("selectedPeriod", selectedPeriod);
        const newChartData = await toggleChart.submit(selectedPeriod);
        portfolioValueChange.value.chartData = newChartData.value.chartData;
        portfolioValueChange.value.period = newChartData.value.period;
        portfolioValueChange.value.totalValueChange =
          newChartData.value.totalValueChange;
        portfolioValueChange.value.percentageOfTotalValueChange =
          newChartData.value.percentageOfTotalValueChange;
      }
    });
  });

  return isPortfolioFullScreen.value ? (
    <PortfolioValue
      portfolioValueChangeLoading={portfolioValueChangeLoading.value}
      totalPortfolioValueLoading={totalPortfolioValueLoading.value}
      totalPortfolioValue={totalPortfolioValue.value}
      isPortfolioFullScreen={isPortfolioFullScreen}
      portfolioValueChange={portfolioValueChange.value.totalValueChange}
      portfolioPercentageValueChange={
        portfolioValueChange.value.percentageOfTotalValueChange
      }
      chartData={portfolioValueChange.value.chartData}
      selectedPeriod={selectedPeriod}
      period={portfolioValueChange.value.period}
      onClick$={(e: any) => {
        togglePeriod(e.target.name);
        changePeriod.value = true;
      }}
    />
  ) : (
    <div class="grid grid-rows-[max(330px)_auto] gap-6 p-10">
      <div class="grid grid-cols-[2fr_1fr_1fr] gap-6">
        <PortfolioValue
          portfolioValueChangeLoading={portfolioValueChangeLoading.value}
          totalPortfolioValueLoading={totalPortfolioValueLoading.value}
          totalPortfolioValue={totalPortfolioValue.value}
          isPortfolioFullScreen={isPortfolioFullScreen}
          portfolioValueChange={portfolioValueChange.value.totalValueChange}
          portfolioPercentageValueChange={
            portfolioValueChange.value.percentageOfTotalValueChange
          }
          chartData={portfolioValueChange.value.chartData}
          selectedPeriod={selectedPeriod}
          period={portfolioValueChange.value.period}
          onClick$={(e: any) => {
            togglePeriod(e.target.name);
            changePeriod.value = true;
          }}
        />

        <div class="custom-border-1 custom-shadow grid min-w-max grid-rows-[32px_1fr] gap-4 rounded-2xl p-6">
          <div class="flex items-center justify-between gap-2">
            <h1 class="text-xl font-semibold">Alerts</h1>
            <button class="custom-border-opacity-30 h-8 rounded-10 px-4 text-xs font-medium duration-300 ease-in-out hover:scale-110">
              See All
            </button>
          </div>
          <div class="">
            <ActionAlertMessage
              title="Bitcoin share exceeded 20%"
              description="6 hours ago"
            />
            <ActionAlertMessage
              title="Bitcoin share exceeded 20%"
              description="6 hours ago"
            />
            <ActionAlertMessage
              title="Bitcoin share exceeded 20%"
              description="6 hours ago"
            />
          </div>
        </div>

        <div class="custom-border-1 custom-shadow grid min-w-max grid-rows-[32px_1fr] gap-4 rounded-2xl p-6">
          <div class="flex items-center justify-between gap-2">
            <h1 class="text-xl font-semibold">Actions</h1>
            <button class="custom-border-opacity-30 h-8 rounded-10 px-4 text-xs font-medium duration-300 ease-in-out hover:scale-110">
              See All
            </button>
          </div>
          <div>
            <ActionAlertMessage title="DCA" description="1 day ago">
              <WarningStatus />
            </ActionAlertMessage>
            <ActionAlertMessage
              title="Automation name #2"
              description="6 hours ago"
            >
              <SuccessStatus />
            </ActionAlertMessage>
            <ActionAlertMessage
              title="Automation name #3"
              description="6 hours ago"
            >
              <WarningStatus />
            </ActionAlertMessage>
          </div>
        </div>
      </div>

      <div class="custom-border-1 grid grid-rows-[32px_1fr] gap-6 rounded-2xl p-6">
        <div class="flex items-center justify-between">
          <h1 class="text-xl font-semibold">Favourite Tokens</h1>
          <button
            class="custom-border-opacity-30 h-8 rounded-10 px-4 text-xs font-medium duration-300 ease-in-out hover:scale-110"
            onClick$={() => {
              nav("/app/portfolio");
            }}
          >
            Go To Portfolio
          </button>
        </div>

        <div class="grid grid-rows-[32px_auto] gap-4">
          <div class="custom-text-50 grid grid-cols-[18%_10%_15%_18%_10%_10%_12%_8%] items-center gap-2 text-xs font-normal uppercase">
            <div class="">Token name</div>
            <div class="">Quantity</div>
            <div class="">Value</div>
            <div class="custom-border-1 flex h-8 w-fit gap-2 rounded-lg bg-white bg-opacity-5 p-1 text-white">
              <button class="custom-bg-button rounded-lg px-2">24h</button>
              <button class="rounded-lg px-2">3d</button>
              <button class="rounded-lg px-2">30d</button>
            </div>
            <div class="">Wallet</div>
            <div class="">Network</div>
            <div class="">Subportfolio</div>
            <div class=""></div>
          </div>
          <div>
            {favoriteTokenLoading.value ? (
              <div class="flex flex-col items-center pt-12">
                <Spinner />
              </div>
            ) : favoriteTokens.value.length === 0 ? (
              <div class="flex flex-col items-center pt-12">
                <span>No Favourite Tokens</span>
              </div>
            ) : (
              favoriteTokens.value[0] &&
              favoriteTokens.value[0].structureBalance.map(
                async (token: any, index: number) => {
                  const formattedBalance = convertWeiToQuantity(
                    token.balance.balance.toString(),
                    parseInt(token.balance.decimals),
                  );
                  return (
                    <TokenRow
                      key={`id_${index}_${token.balance.name}`}
                      subportfolio={favoriteTokens.value[0].structure.name}
                      tokenName={token.balance.name}
                      tokenSymbol={token.balance.symbol}
                      quantity={formattedBalance}
                      value={(
                        Number(formattedBalance) *
                        Number(token.balance.balanceValueUSD)
                      ).toFixed(2)}
                      wallet={token.wallet.name}
                      networkName={chainIdToNetworkName[token.wallet.chainId]}
                      imagePath={token.balance.imagePath}
                    />
                  );
                },
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
