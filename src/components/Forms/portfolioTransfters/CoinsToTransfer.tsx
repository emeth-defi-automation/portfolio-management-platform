import { component$, $ } from "@builder.io/qwik";
import { FormBadge } from "~/components/FormBadge/FormBadge";

import IconArrowDown from "@material-design-icons/svg/filled/expand_more.svg?jsx";
import { type BatchTransferFormStore } from "~/routes/app/portfolio/interface";
import { hasExecutableWallet } from "~/utils/validators/availableStructure";
import CheckBox from "~/components/Atoms/Checkbox/Checkbox";

export interface CoinsToTransferProps {
  batchTransferFormStore: BatchTransferFormStore;
  availableStructures: any;
}

export default component$<CoinsToTransferProps>(
  ({ batchTransferFormStore, availableStructures }) => {
    return (
      <>
        {availableStructures?.value.structures.map(
          (structure: any, index: number) => {
            return (
              <>
                {hasExecutableWallet(structure) ? (
                  <div
                    class="scrollbar mb-4 flex max-h-[250px] flex-col overflow-auto"
                    key={`${structure.name}${index}`}
                  >
                    <div class="flex gap-2">
                      <IconArrowDown class="h-4 w-4 fill-white" />
                      <p class="text-sm">{structure.structure.name}</p>
                    </div>
                    <div class="mr-2 flex flex-col gap-2 py-2">
                      {structure.structureBalance.map(
                        (balance: any, index: number) => {
                          const currentStructure =
                            batchTransferFormStore.coinsToTransfer.find(
                              (struct) =>
                                struct.name === structure.structure.name,
                            );

                          const currentCoin = currentStructure?.coins.find(
                            (item) =>
                              item.wallet === balance.wallet.name &&
                              item.symbol === balance.balance.symbol,
                          );

                          return balance.wallet.isExecutable ? (
                            <FormBadge
                              key={index}
                              tokenName={balance.balance.symbol}
                              tokenSymbol={balance.wallet.name}
                              tokenPath={`/assets/icons/tokens/${balance.balance.symbol.toLowerCase()}.svg`}
                            >
                              <CheckBox
                                name={`${structure.structure.name}${balance.wallet.name}${balance.balance.symbol}`}
                                isChecked={currentCoin?.isChecked ?? false}
                                onClick={$(() => {
                                  if (currentCoin) {
                                    currentCoin.isChecked =
                                      !currentCoin.isChecked;
                                  }
                                })}
                                // value={`${structure.structure.name}${balance.balance.symbol}`}
                              />
                            </FormBadge>
                          ) : null;
                        },
                      )}
                    </div>
                  </div>
                ) : null}
              </>
            );
          },
        )}
      </>
    );
  },
);
