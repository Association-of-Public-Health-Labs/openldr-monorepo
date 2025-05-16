
import Image from "next/image";

export default function AuthLayout({children}: {children: React.ReactNode}) {
  
  return (
    <div className="relative min-h-screen w-full flex">
      {/* Background Illustration */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/bg5.png"
          alt="Sign up illustration"
          fill
          style={{ objectFit: "cover" }}
          className="w-full h-full"
          priority
        />
      </div>

      {/* Right-side Form */} 
      <div className="absolute right-0 bottom-0 top-0 z-10 flex  items-center justify-center px-10">
        {children}
      </div>
    </div>
  );
}
