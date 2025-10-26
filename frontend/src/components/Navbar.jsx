import React, { useEffect, useState } from "react";
import { useHelpBox } from "../hooks/useHelpBox.js";
import { useWalletConnection } from "../hooks/useWalletConnection.js";
import logo from "../assets/Drasko.png";

const Navbar = () => {

  const [currentPath, setCurrentPath] = useState("");
  const { openHelp } = useHelpBox();
  const { address, connectWallet, isConnecting, getShortAddress } = useWalletConnection();

  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  const linkClasses = (path) =>
    `hover:text-purple-300 transition ${currentPath === path ? "underline underline-offset-4 text-purple-300" : ""
    }`;

  return (
    <div className="flex justify-between items-center px-6 md:px-16 py-4 absolute top-0 left-0 w-full z-20">
      <div className="flex items-center gap-2">
        <a href="/">
          <img src={logo} alt="Tradesynth Logo" className="h-20 object-contain cursor-pointer" />
        </a>
      </div>

      <div className="hidden md:flex gap-8 text-white text-sm md:text-base">
        <a href="/profile" className={linkClasses("/profile")} >Profile</a>
        <a href="/create-agent" className={linkClasses("/create-agent")}>Create Agent</a>
        <a href="/trade-history" className={linkClasses("/trade-history")}>Trade History</a>
        <button
          onClick={openHelp}
          className="hover:text-purple-300 transition focus:outline-none">
          Help
        </button>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={connectWallet}
          disabled={isConnecting || !!address}
          className="bg-white text-black px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isConnecting ? "Connecting..." : address ? `Connected: ${getShortAddress(address)}` : "Connect Wallet"}
        </button>
      </div>
    </div>
  );
};

export default Navbar;