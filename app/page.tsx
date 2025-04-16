import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-100">
      <div className="w-full max-w-md space-y-8">
        <h1 className="text-3xl font-bold text-center text-gray-900">
          Welcome to nextINvoice
        </h1>
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/auth/login">Login</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/auth/register">Register</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
