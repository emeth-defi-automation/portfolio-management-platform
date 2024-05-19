import type {
  Structure,
  StructureBalance,
} from "~/interface/structure/Structure";

export const hasExecutableWallet = (
  structures: Structure[] | Structure,
): boolean => {
  if (Array.isArray(structures)) {
    return structures.some((structure: Structure) =>
      structure.structureBalance.some(
        (item: StructureBalance) => item.wallet.isExecutable,
      ),
    );
  } else {
    return structures.structureBalance.some(
      (item: StructureBalance) => item.wallet.isExecutable,
    );
  }
};
