import { type QRL, Slot, component$ } from "@builder.io/qwik";
import IconInfo from "/public/assets/icons/info-white.svg?jsx";
import { Button } from "../Buttons/Buttons";

export interface NoDataAddedProps {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonOnClick$?: QRL<() => Promise<void>>;
}

export const NoDataAdded = component$<NoDataAddedProps>((props) => {
  return (
    <>
      <div class="flex flex-col h-full items-center justify-center gap-6">
        <div class="flex flex-col justify-center gap-4 text-center">
          <div class="grid justify-center">
            <IconInfo height={40} width={40} />
          </div>
          <div class="flex flex-col gap-2">
            <h3 class="text-sm font-medium">{props.title}</h3>
            <p class="custom-text-50 text-xs">{props.description}</p>
          </div>
          <div class="flex justify-center">
            <Slot />
            <Button
              text={props.buttonText}
              onClick$={props.buttonOnClick$}
              class="h-8 w-fit border-0 bg-customBlue px-4 text-xs font-medium"
            />
          </div>
        </div>
      </div>
    </>
  );
});
