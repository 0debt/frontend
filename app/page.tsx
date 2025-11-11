import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <Image
        src="/0debt-logo.svg"
        alt="0debt Logo"
        width={100}
        height={100}
        draggable={false}
      />
      <Button className="mt-2">Hello World</Button>
    </div>

  );
}