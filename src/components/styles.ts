export const primaryButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-md bg-indigo-800 px-4 text-sm font-semibold text-white hover:bg-indigo-950";

export const secondaryButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-md border border-indigo-800 bg-white px-4 text-sm font-semibold text-indigo-800 hover:bg-indigo-50";

export const pillLinkClass =
  "inline-flex min-h-9 items-center gap-1 rounded-full border border-stone-300 bg-white px-3 text-sm font-medium text-indigo-800 hover:border-indigo-400 hover:bg-indigo-50";

export const fieldClass =
  "w-full rounded-md border border-stone-300 bg-white px-2 py-2 text-base text-stone-950 placeholder:text-stone-500 md:text-sm";

export const chipClass = (active: boolean) =>
  active
    ? "inline-flex min-h-9 items-center rounded-full bg-indigo-800 px-3 text-sm font-medium text-white"
    : "inline-flex min-h-9 items-center rounded-full border border-stone-300 bg-white px-3 text-sm font-medium text-stone-800 hover:border-indigo-300";

export const textLinkClass = "font-medium text-indigo-800 hover:underline";
