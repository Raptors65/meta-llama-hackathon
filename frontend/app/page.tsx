import Image from "next/image";
import logo from "./logo.png";

export default function Home() {

  return (
    <main className="flex justify-center items-center h-screen w-screen">
      <div className="flex justify-center flex-col">
        <Image alt="Logo" src={logo} width={405} height={180} />
        <a href="/chat" className="rounded-full text-xl text-center p-5 bg-[#2C2C2C] text-white shadow-md mt-5">Begin your journey</a>

        <a href="/api/auth/login?returnTo=/chat" className="rounded-full text-xl text-center p-5 bg-[#2C2C2C] text-white shadow-md mt-5">Begin your journey</a>

      </div>
    </main>
  );
}
