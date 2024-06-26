import { component$ } from "@builder.io/qwik";
import { FormBadge } from "~/components/FormBadge/FormBadge";

import IconArrowDown from "@material-design-icons/svg/filled/expand_more.svg?jsx";
import { type BatchTransferFormStore } from "~/routes/app/portfolio/interface";
import { hasExecutableWallet } from "~/utils/validators/availableStructure";

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
                              text={balance.balance.symbol}
                              class="!mb-3"
                              customClass="h-[56px]"
                              labelClass="start-4"
                              description={balance.wallet.name}
                              image={`/assets/icons/tokens/${balance.balance.symbol.toLowerCase()}.svg`}
                              for={`${structure.structure.name}${balance.wallet.name}${balance.balance.symbol}`}
                            >
                              <input
                                id={`${structure.structure.name}${balance.wallet.name}${balance.balance.symbol}`}
                                name={`${structure.structure.name}${balance.wallet.name}${balance.balance.symbol}`}
                                type="checkbox"
                                checked={currentCoin?.isChecked}
                                // value={`${structure.structure.name}${balance.balance.symbol}`}
                                class="border-gradient custom-border-1 custom-bg-white checked checked:after:border-bg absolute end-4 z-10  h-6 w-6 appearance-none rounded checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:h-2.5 checked:after:w-1.5 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:rotate-45 checked:after:border-solid hover:cursor-pointer focus:after:absolute focus:after:z-[1]"
                                onClick$={() => {
                                  if (currentCoin) {
                                    currentCoin.isChecked =
                                      !currentCoin.isChecked;
                                  }
                                }}
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
