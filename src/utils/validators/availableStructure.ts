import type {Structure} from "~/interface/structure/Structure";

export const hasExecutableWallet = (structures: Structure[]) => {
  return structures.some((structure: Structure) =>
    structure.structureBalance.some((item: any) => item.wallet.isExecutable)
  );
};
