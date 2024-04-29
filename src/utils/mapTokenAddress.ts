export function mapTokenAddress(sepoliaAddress: string): any {
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
