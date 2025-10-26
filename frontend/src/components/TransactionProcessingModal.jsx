import React from "react";

const TransactionProcessingModal = ({ message = "Transaction is being processed..." }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-gray-900 border border-purple-400 rounded-xl p-8 flex flex-col items-center shadow-2xl animate-fadeIn">
                <div className="mb-4">
                    <svg className="animate-spin h-12 w-12 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                </div>
                <div className="text-lg text-white font-semibold text-center mb-2">
                    {message}
                </div>
                <div className="text-purple-300 text-sm text-center">Please confirm in your wallet and do not close this window.</div>
            </div>
        </div>
    );
};

export default TransactionProcessingModal; 