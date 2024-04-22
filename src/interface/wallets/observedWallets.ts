import { type Surreal } from "surrealdb.js";
import { z } from "@builder.io/qwik-city";
import { checksumAddress, getAddress } from "viem";

export const GetResultAddresses = z.object({
  address: z.string(),
  name: z.string()
});

export type GetResultAddresses = z.infer<typeof GetResultAddresses>;

export const getResultAddresses = async (db: Surreal, userId: string) => {
  const resultAddresses = (
    await db.query(`SELECT out.address as address, name FROM '${userId}'->observes_wallet;`)
  ).at(0);
  return GetResultAddresses.array().parse(resultAddresses);
};

export const GetWalletDetails = z.object({
  chainId: z.number(),
  id: z.string(),
  address: z.string(),
});

export type GetWalletDetails = z.infer<typeof GetWalletDetails>;

export const getWalletDetails = async (db: Surreal, address: string) => {
  const walletDetails = (
    await db.query(
      `SELECT id, address, chainId, isExecutable FROM wallet WHERE address = '${getAddress(address)}';`,
    )
  ).at(0);
  return GetWalletDetails.array().parse(walletDetails);
};

export const GetBalanceToUpdate = z.object({
  id: z.string(),
  value: z.string(),
});

export type GetBalanceToUpdate = z.infer<typeof GetBalanceToUpdate>;

export const getBalanceToUpdate = async (
  db: Surreal,
  accountAddress: string,
  tokenAddress: string,
) => {
  const balanceToUpdate = (
    await db.query(
      `SELECT * FROM balance WHERE ->(for_wallet WHERE out.address = '${getAddress(accountAddress)}') AND ->(for_token WHERE out.address = '${getAddress(tokenAddress)}');`,
    )
  ).at(0);
  return GetBalanceToUpdate.array().parse(balanceToUpdate);
};

export const GetDBTokensAddresses = z.array(
  z.object({
    address: z.string(),
  }),
);

export type GetDBTokensAddresses = z.infer<typeof GetDBTokensAddresses>;

export const getDBTokensAddresses = async (db: Surreal) => {
  const tokensAddresses = (await db.query(`SELECT address FROM token;`)).at(0);
  return GetDBTokensAddresses.parse(tokensAddresses);
};

export const GetDBTokenPriceUSD = z.object({
  priceUSD: z.string(),
});

export type GetDBTokenPriceUSD = z.infer<typeof GetDBTokenPriceUSD>;

export const getDBTokenPriceUSD = async (db: Surreal, tokenAddress: string) => {
  const tokenPriceUSD = (
    await db.query(
      `SELECT priceUSD FROM token WHERE address = '${checksumAddress(tokenAddress as `0x${string}`)}';`,
    )
  ).at(0);
  return GetDBTokenPriceUSD.array().parse(tokenPriceUSD);
};

const TokenDayDataSchema = z.object({
  token: z.object({
    id: z.string(),
  }),
  priceUSD: z.string(),
});

const TokenDayDataResponseSchema = z.object({
  data: z.object({
    tokenDayDatas: z.array(TokenDayDataSchema),
  }),
});

export async function fetchTokenDayData(
  uniswapSubgraphURL: string,
  tokenAddresses: string[],
) {
  const query = `
  {
    tokenDayDatas(
      first: ${tokenAddresses.length}
      where: {
        token_in: ${JSON.stringify(tokenAddresses)}
      }
      orderBy: date
      orderDirection: desc
    ) {
      token {
        id
      }
      priceUSD
    }
  }`;

  const response = await fetch(uniswapSubgraphURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
    }),
  });

  const {
    data: { tokenDayDatas },
  } = TokenDayDataResponseSchema.parse(await response.json());

  return tokenDayDatas;
}

export const GetTokenImagePath = z.object({
  imagePath: z.string(),
});

export type GetTokenImagePath = z.infer<typeof GetTokenImagePath>;

export const getTokenImagePath = async (db: Surreal, tokenSymbol: string) => {
  const tokenImagePath = (
    await db.query(
      `SELECT imagePath FROM token WHERE symbol = '${tokenSymbol}';`,
    )
  ).at(0);
  return GetTokenImagePath.array().parse(tokenImagePath);
};
