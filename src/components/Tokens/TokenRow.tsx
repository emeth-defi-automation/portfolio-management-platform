import { component$ } from "@builder.io/qwik";
import IconStar from "@material-design-icons/svg/filled/star.svg?jsx";
import IconGraph from "/public/assets/icons/graph.svg?jsx";
import ParagraphAnnotation from "../Molecules/ParagraphAnnotation/ParagraphAnnotation";

export interface TokenRowProps {
  tokenName?: string;
  tokenSymbol?: string;
  quantity?: string;
  value?: string;
  wallet?: string;
  networkName?: string;
  subportfolio?: string;
  imagePath?: string;
}

export const TokenRow = component$<TokenRowProps>(
  ({
    tokenName,
    tokenSymbol,
    quantity,
    value,
    wallet,
    networkName,
    subportfolio,
    imagePath,
  }) => {
    return (
      <div class="custom-border-b-1-opacity-5 grid h-16 grid-cols-[18%_10%_15%_18%_10%_10%_12%_8%] items-center gap-2 text-sm last:border-b-0 last:pb-0 ">
        <ParagraphAnnotation
          paragraphText={tokenName}
          annotationText={tokenSymbol}
          variant="annotationNear"
          hasIconBox={true}
          iconBoxSize="small"
          iconBoxTokenPath={imagePath}
        />
        <div class="overflow-auto">{quantity}</div>
        <div class="overflow-auto">${value}</div>
        <div class="flex gap-4 text-customGreen">
          +3,36%
          <IconGraph />
        </div>
        <div class="overflow-auto">{wallet}</div>
        <div class="overflow-auto">{networkName}</div>
        <div class="overflow-auto">{subportfolio}</div>
        <IconStar class="h-4 w-4 fill-customWarning" />
      </div>
    );
  },
);
