import React, { useState } from 'react';
import { useWalletConnection } from '../hooks/useWalletConnection.js';
import { swapETHForTokens, getAmountOut } from '../utils/AMMInteractions.js';
import { toast } from 'react-toastify';

const SwapInterface = () => {
    const { signer } = useWalletConnection();
    const [ethAmount, setEthAmount] = useState('');
    const [selectedToken, setSelectedToken] = useState('DAI');
    const [amountOut, setAmountOut] = useState('');
    const [loading, setLoading] = useState(false);

    const tokens = ['DAI', 'WETH', 'MKR'];

    const handleGetAmountOut = async () => {
        if (!ethAmount || !signer) return;

        try {
            const output = await getAmountOut(selectedToken, ethAmount, signer);
            setAmountOut(output);
        } catch (error) {
            console.error('Error getting amount out:', error);
            toast.error('Failed to get amount out');
        }
    };

    const handleSwap = async () => {
        if (!ethAmount || !signer) {
            toast.error('Please enter amount and connect wallet');
            return;
        }

        try {
            setLoading(true);
            const minAmountOut = parseFloat(amountOut) * 0.95;
            await swapETHForTokens(selectedToken, ethAmount, minAmountOut, signer);
            toast.success('Swap completed successfully!');
            setEthAmount('');
            setAmountOut('');
        } catch (error) {
            console.error('Error swapping:', error);
            toast.error('Swap failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 max-w-md">
            <h3 className="text-xl font-semibold mb-4 text-white">Swap ETH for Tokens</h3>

            <div className="space-y-4">
                <div>
                    <label className="block text-white/70 text-sm mb-2">ETH Amount</label>
                    <input
                        type="number"
                        placeholder="0.0"
                        value={ethAmount}
                        onChange={(e) => setEthAmount(e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>

                <div>
                    <label className="block text-white/70 text-sm mb-2">Token to Receive</label>
                    <select
                        value={selectedToken}
                        onChange={(e) => setSelectedToken(e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        {tokens.map(token => (
                            <option key={token} value={token}>{token}</option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={handleGetAmountOut}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition"
                >
                    Get Amount Out
                </button>

                {amountOut && (
                    <div className="bg-white/5 p-3 rounded-md">
                        <p className="text-white/70 text-sm">You will receive:</p>
                        <p className="text-white font-semibold">{parseFloat(amountOut).toFixed(6)} {selectedToken}</p>
                    </div>
                )}

                <button
                    onClick={handleSwap}
                    disabled={loading || !ethAmount || !amountOut}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-2 rounded-md transition disabled:opacity-50"
                >
                    {loading ? 'Swapping...' : 'Swap'}
                </button>
            </div>
        </div>
    );
};

export default SwapInterface; 