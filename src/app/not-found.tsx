import Link from "next/link";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata(
  "Page not found",
  "This address is not a page on Home Gym Fit.",
  "/404.html",
);

export default function NotFound() {
  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
      <p>
        <Link href="/" className="font-medium text-indigo-800 underline">
          Back to the directory home
        </Link>
      </p>
    </div>
  );
}
