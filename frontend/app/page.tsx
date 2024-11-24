import Image from "next/image";
import logo from "./logo.png";
import Link from "next/link";

export default function Home() {

  return (
    <main className="flex justify-center items-center h-screen w-screen">
      <div className="flex justify-center flex-col">
        <Image alt="Logo" src={logo} width={405} height={180} />

        <Link href="/api/auth/login?returnTo=/chat" className="rounded-full text-xl text-center p-5 bg-[#2C2C2C] text-white shadow-md mt-5
        transition-all duration-300 ease-in-out transform hover:shadow-lg hover:scale-105">
        Begin your journey</Link>
        <a href="/chat" className="rounded-full text-sm text-center p-3 bg-[#e8e8e8] text-black 
        shadow-md mt-5 absolute bottom-4 left-1/2 transform -translate-x-1/2
        transition-all duration-300 ease-in-out transform hover:shadow-lg hover:scale-105"> 
        Continue as guest</a>

      </div>
    </main>
  );
}
