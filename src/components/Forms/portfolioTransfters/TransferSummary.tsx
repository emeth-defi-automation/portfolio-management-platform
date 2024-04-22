import { component$ } from "@builder.io/qwik";
import { type BatchTransferFormStore } from "~/routes/app/portfolio";
import ImgBtc from "../../../../public/assets/icons/tokens/btc.svg?jsx";

export interface TransferSummeryProps {
  batchTransferFormStore: BatchTransferFormStore;
  availableStructures: any;
}

export default component$<TransferSummeryProps>(
  () => {
    return (
      <>
        <p class="custom-text-50 text-xs font-light uppercase">Summary</p>
        <div class="scrollbar max-h-[250px] overflow-auto">
          <div class="mb-4 flex flex-col gap-2">
            <p class="">Structure name</p>
            <div class="custom-bg-white relative flex min-h-12 w-full items-center justify-between rounded-lg p-3">
              <div class="absolute start-4 flex items-center gap-2">
                <div class="custom-border-1 custom-shadow-2 mr-2 rounded-lg p-1">
                  <ImgBtc width="16" height="16" />
                </div>
                <div class="">
                  <p>BTC</p>
                  <p class="custom-text-50 text-xs">Bitcoin</p>
                </div>
              </div>
              <div class="absolute end-4 text-right">
                <p class="custom-text-gradient text-sm text-transparent">
                  1.00 ($60,000)
                </p>
                <p class="text-sm">Quantity</p>
              </div>
            </div>
          </div>
          <div class="mb-4 flex flex-col gap-2">
            <p class="">Structure name 2</p>
            <div class="custom-bg-white relative flex min-h-12 w-full items-center justify-between rounded-lg p-3">
              <div class="absolute start-4 flex items-center gap-2">
                <div class="custom-border-1 custom-shadow-2 mr-2 rounded-lg p-1">
                  <ImgBtc width="16" height="16" />
                </div>
                <div class="">
                  <p>BTC</p>
                  <p class="custom-text-50 text-xs">Bitcoin</p>
                </div>
              </div>
              <div class="absolute end-4 text-right">
                <p class="custom-text-gradient text-sm text-transparent">
                  1.00
                </p>
                <p class="text-sm">Quantity</p>
              </div>
            </div>
          </div>
        </div>
        <label class="custom-text-50 flex items-center gap-2 text-xs font-light">
          <input
            type="checkbox"
            name=""
            id=""
            class="border-gradient custom-border-1 custom-bg-white checked:after:border-bg  z-10 h-6 w-6 appearance-none rounded checked:after:absolute checked:after:ms-2 checked:after:mt-1 checked:after:h-2.5 checked:after:w-1.5 checked:after:rotate-45 checked:after:border-solid hover:cursor-pointer focus:after:absolute focus:after:z-[1]"
          />
          <span>
            I want to confirm that I am 100% sure about sending the tokens.
            Please proceed with the transfer.
          </span>
        </label>
      </>
    );
  },
);
