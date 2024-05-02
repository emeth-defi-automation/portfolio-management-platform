import type WebSocketStrategy from "surrealdb.js";

export async function indexWalletBalance(
  db: WebSocketStrategy,
  tokenAddress: string,
  walletAddress: string,
  blockTimestamp: string,
  blockNumber: string,
  transactionHash: string,
  value: number,
) {
  try {
    await db.query(`
        LET $tokenId = SELECT VALUE in FROM token_balance
        WHERE out IN (
        SELECT VALUE id FROM token
        WHERE address = '${tokenAddress}');

        LET $walletId = SELECT VALUE in FROM wallet_token_balance
        WHERE out IN (
        SELECT VALUE id FROM wallet
        WHERE address = '${walletAddress}');

        LET $value =
        SELECT timestamp, value
        FROM wallet_balance
        WHERE id IN $tokenId
        AND id IN  $walletId
        AND timestsamp <= '${blockTimestamp}'
        ORDER BY timestamp DESC
        LIMIT 1;

        LET $balance = (CREATE wallet_balance SET
        blockNumber = '${blockNumber}',
        timestamp = '${blockTimestamp}',
        transactionHash = '${transactionHash}',
        value = IF $value[0].value = NONE THEN (RETURN ${value}) ELSE ($value[0].value + ${value}) END);

        RELATE ONLY ($balance.id) ->token_balance-> (RETURN SELECT id FROM token WHERE address = '${tokenAddress}');
        RELATE ONLY ($balance.id) ->wallet_token_balance-> (RETURN SELECT id FROM wallet WHERE address = '${walletAddress}');
      `);
  } catch (e) {
    console.log("Something went wrong with indexing transaction", e);
  }
}
