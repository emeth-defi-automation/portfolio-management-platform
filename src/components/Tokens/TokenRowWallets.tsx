import { type Signal, component$ } from "@builder.io/qwik";
// import Button from "../Atoms/Buttons/Button";
// import IconMenuDots from "@material-design-icons/svg/outlined/more_vert.svg?jsx";
import IconGraph from "/public/assets/icons/graph.svg?jsx";
import { type TransferredCoinInterface } from "~/routes/app/wallets/interface";
import ParagraphAnnotation from "../Molecules/ParagraphAnnotation/ParagraphAnnotation";

type TokenRowWalletsProps = {
  name: string;
  symbol: string;
  balance: string;
  imagePath: string;
  balanceValueUSD: string;
  isTransferModalOpen: Signal<boolean>;
  address: string;
  transferredCoin: TransferredCoinInterface;
  allowance: string;
  isExecutable: boolean | undefined;
};

export const TokenRowWallets = component$<TokenRowWalletsProps>(
  ({ name, symbol, balance, imagePath, balanceValueUSD, allowance }) => {
    return (
      <>
        <div class="custom-border-b-1 grid  grid-cols-[25%_18%_18%_18%_18%_18%] items-center gap-2 py-2 text-sm">
          <ParagraphAnnotation
            paragraphText={name}
            annotationText={symbol}
            variant="annotationNear"
            hasIconBox={true}
            iconBoxSize="small"
            iconBoxTokenPath={imagePath}
          />
          <div class="overflow-auto">{balance}</div>
          <div class="overflow-auto">${balanceValueUSD}</div>
          <div class="">{allowance}</div>
          <div class="flex h-full items-center gap-4">
            <span class="text-customGreen">3,6%</span>
            <IconGraph />
          </div>
          <div class="text-right">
            {/* <Button
              variant="onlyIcon"
              leftIcon={<IconMenuDots class="w-4 h-4 fill-white/>}
            /> */}
          </div>
        </div>
      </>
    );
  },
);
