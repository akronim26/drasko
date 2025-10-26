import React from 'react';
import { useWalletConnection } from '../hooks/useWalletConnection.js';

const WalletStatus = () => {
    const {
        address,
        isConnecting,
        connectWallet,
        disconnectWallet,
        getShortAddress,
        isConnected
    } = useWalletConnection();

    return (
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 max-w-md">
            <h3 className="text-white font-semibold mb-4">Wallet Status</h3>

            {!isConnected ? (
                <div className="space-y-3">
                    <p className="text-white/70 text-sm">
                        No wallet connected
                    </p>
                    <button
                        onClick={connectWallet}
                        disabled={isConnecting}
                        className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-500 text-white font-medium py-2 px-4 rounded-md transition"
                    >
                        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-white/70 text-sm">Connected:</span>
                        <span className="text-white font-mono text-sm">
                            {getShortAddress(address)}
                        </span>
                    </div>
                    <button
                        onClick={disconnectWallet}
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md transition"
                    >
                        Disconnect Wallet
                    </button>
                </div>
            )}
        </div>
    );
};

export default WalletStatus; 