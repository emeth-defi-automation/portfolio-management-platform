import { component$ } from "@builder.io/qwik";
import IconInfo from "/public/assets/icons/info-blue.svg?jsx";
import Button from "../Atoms/Buttons/Button";

export const PendingAuthorization = component$(() => {
  return (
    <>
      <div class="flex items-center justify-between gap-6 rounded-2xl border border-blue-500 bg-blue-500 bg-opacity-20 p-6">
        <div class="">
          <h2 class="mb-4 flex items-center gap-2 text-sm">
            <IconInfo /> Pending authorization
          </h2>
          <p class="text-xs">
            This wallet requires authorization. Click Authorize to log in using
            this wallet and approve all associated tokens.
          </p>
        </div>
        <div class="lg:flex lg:gap-2">
          <Button variant="transparent" text="Dismiss" size="small" />
          <Button variant="blue" text="Authorize" size="small" />
        </div>
      </div>
    </>
  );
});
