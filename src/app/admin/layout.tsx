
import { Providers } from "../providers";
import { ToastContainer } from "react-toastify";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-white min-h-screen w-full">
      
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="w-full"><Providers >{children}</Providers> </div>
    </div>
  );
}
