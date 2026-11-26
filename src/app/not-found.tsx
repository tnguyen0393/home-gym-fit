import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
      <p>
        <Link href="/" className="underline">
          Back to the directory home
        </Link>
      </p>
    </div>
  );
}
