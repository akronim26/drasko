import React, { useState } from "react";

const MultiSelectDropdown = ({selectedTokens,setSelectedTokens}) => {
  const [isOpen, setIsOpen] = useState(false);
  const options = ["DAI", "WETH", "MKR"];

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleOptionClick = (token) => {
    setSelectedTokens((prev) =>
      prev.includes(token)
        ? prev.filter((t) => t !== token)
        : [...prev, token]
    );
  };

  return (
    <div className="relative w-full z-50">
      <div
        onClick={toggleDropdown}
        className="w-full bg-white/10 backdrop-blur-lg text-white px-4 py-3 rounded-md border border-white/20 cursor-pointer z-50"
      >
        {selectedTokens.length > 0
          ? selectedTokens.join(", ")
          : "Token(s)"}
      </div>

      {isOpen && (
        <div className="absolute mt-2 w-full bg-[#1f1f2f] border border-white/20 rounded-md shadow-lg z-50">
          {options.map((token) => (
            <div
              key={token}
              className={`px-4 py-2 cursor-pointer text-white hover:bg-purple-500/30 z-50 transition ${
                selectedTokens.includes(token) ? "bg-purple-500/20" : ""
              }`}
              onClick={() => handleOptionClick(token)}
            >
              {token}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;