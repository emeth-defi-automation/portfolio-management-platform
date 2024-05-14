import { QRL, component$ } from "@builder.io/qwik";
import Box from "../../../../../components/Atoms/Box/Box";
import Header from "../../../../../components/Atoms/Headers/Header";
// import IconHistory from "@material-design-icons/svg/filled/history.svg?jsx";
// import IconSettings from "@material-design-icons/svg/outlined/settings.svg?jsx";
import Button from "../../../../../components/Atoms/Buttons/Button";
import Input from "../../../../../components/Atoms/Input/Input";
import Select from "../../../../../components/Atoms/Select/Select";

interface SwapModalProps  {
 onSwap: QRL<()=> Promise<void>> | (() => Promise<void>),
 onCancel: QRL<()=> void> | (()=> void),

}

export const SwapModal = component$<SwapModalProps>(({onCancel, onSwap}) => {
  return (
      <Box customClass="min-w-[500px] max-w-[500px] flex flex-col gap-6 font-['Sora']">
        {/* HEADER */}
        <div class="flex items-center justify-between">
          <Header variant="h3" text="Swap" />
          <div class="flex items-center gap-4">
            <div class="flex gap-1.5">
              {/* <IconHistory class="h-4 w-4 fill-white" /> */}
              <span class="cursor-pointer text-xs">History</span>
            </div>
            <div class="flex items-center gap-1.5">
              {/* <IconSettings class="h-4 w-4 fill-white" /> */}
              <span class="cursor-pointer  text-xs">Slippage</span>
            </div>
          </div>
        </div>
        {/* TOKENS */}
        <div class="flex flex-col gap-2">
          <Box customClass="!shadow-none flex justify-between p-4 rounded-xl">
            <div class="flex flex-col gap-6">
              <div class="flex flex-col gap-2">
                <span class="text-xs font-normal text-white/60">You Pay</span>
                <Input
                  placeholder="00.00"
                  customClass="!border-0 p-0 text-[28px] h-fit"
                  
                />
              </div>
              <span class="text-xs font-normal text-white/60">$100.00</span>
            </div>
            <Select
            name=''              
            options={[
                { value: "", text: 'USDC'},
                { value: "Ethereum", text: "Ethereum" },
              ]}
              size="medium"
              class="h-8 pr-0"
            />
          </Box>
          <Box customClass="!shadow-none flex justify-between p-4 rounded-xl">
            <div class="flex flex-col gap-6">
              <div class="flex flex-col gap-2">
                <span class="text-xs font-normal text-white/60">
                  You receive
                </span>
                <Input
                  placeholder="100.00"
                  customClass="!border-0 p-0 text-[28px] h-fit"
                />
              </div>
              <span class="text-xs font-normal text-white/60">$100.00</span>
            </div>
            <Select
            name=''
              options={[
                { value: "", text: "USDC" },
                { value: "Ethereum", text: "Ethereum" },
              ]}
              size="medium"
              class="h-8 pr-0"
            />
          </Box>
        </div>
        {/* BUTTONS */}
        <div class="flex items-center gap-4">
          <Button variant="transparent" text="Cancel" class="w-full" 
          onClick$={() => oncancel}/>
          <Button variant="blue" text="Swap Tokens" class="w-full" 
          onClick$={() => onSwap}
          />
        </div>
      </Box>
  
  );
});