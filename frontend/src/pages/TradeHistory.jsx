import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useWalletConnection } from "../hooks/useWalletConnection.js";
import { getUserAgents } from "../utils/AgentInteractions.js";
import { getPoolInfo, getTokenBalance } from "../utils/AMMInteractions.js";
import { toast } from "react-toastify";
import { ethers } from "ethers";

const TradeHistoryPage = () => {
    const { address, signer } = useWalletConnection();
    const [agents, setAgents] = useState([]);
    const [poolData, setPoolData] = useState({});
    const [tokenBalances, setTokenBalances] = useState({});
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const userAgents = await getUserAgents(address, signer);
            setAgents(userAgents);

            const tokens = ['DAI', 'WETH', 'MKR'];
            const poolInfo = {};
            const balances = {};

            for (const token of tokens) {
                try {
                    poolInfo[token] = await getPoolInfo(token, signer);
                    balances[token] = await getTokenBalance(token, address, signer);
                } catch (error) {
                    console.error(`Error loading ${token} data:`, error);
                    poolInfo[token] = null;
                    balances[token] = "0";
                }
            }

            setPoolData(poolInfo);
            setTokenBalances(balances);
        } catch (error) {
            console.error("Error loading data:", error);
            toast.error("Failed to load trading data");
        } finally {
            setLoading(false);
        }
    }, [address, signer]);

    useEffect(() => {
        if (address && signer) {
            loadData();
        }
    }, [loadData, address, signer]);

    const getPlatformName = (platformType) => {
        switch (platformType) {
            case 0: return "Telegram";
            case 1: return "Twitter";
            case 2: return "Discord";
            default: return "Unknown";
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#000000] overflow-hidden relative">
            <Navbar />

            <iframe
                src="https://sincere-polygon-333639.framer.app/404-2"
                className="absolute top-0 left-40 w-[150vw] h-[150vh] scale-[1.2] z-[0]"
                frameBorder="0"
                allowFullScreen
            />

            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[500px] h-[200px] bg-purple-300 opacity-50 blur-[180px] rounded-full z-0" />

            <div className="absolute bottom-[500px] left-[1400px] transform translate-x-[-20%] translate-y-[40%] opacity-80 z-[1]">
                <div className="relative">
                    {/* Main sphere */}
                    <div
                        className="w-80 h-80 rounded-full relative"
                        style={{
                            background: 'radial-gradient(circle at 30% 30%, #a855f7, #7c3aed, #5b21b6, #3730a3)',
                            boxShadow: '0 0 100px rgba(168, 85, 247, 0.8), 0 0 200px rgba(168, 85, 247, 0.4), inset 0 0 60px rgba(255, 255, 255, 0.1)',
                            animation: 'sphereGlow 4s ease-in-out infinite alternate'
                        }}
                    >
                        {/* Inner highlight */}
                        <div
                            className="absolute top-8 left-8 w-16 h-16 rounded-full"
                            style={{
                                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, transparent 70%)',
                                filter: 'blur(4px)'
                            }}
                        />

                        {/* Surface reflections */}
                        <div
                            className="absolute top-12 left-12 w-8 h-8 rounded-full"
                            style={{
                                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 80%)',
                                filter: 'blur(2px)'
                            }}
                        />
                    </div>

                    {/* Outer glow rings */}
                    <div
                        className="absolute inset-0 w-80 h-80 rounded-full animate-pulse"
                        style={{
                            background: 'radial-gradient(circle, transparent 40%, rgba(168, 85, 247, 0.3) 70%, transparent 100%)',
                            animation: 'pulseGlow 3s ease-in-out infinite'
                        }}
                    />

                    {/* Larger outer glow */}
                    <div
                        className="absolute inset-0 w-96 h-96 rounded-full -translate-x-8 -translate-y-8"
                        style={{
                            background: 'radial-gradient(circle, transparent 0%, rgba(168, 85, 247, 0.2) 80%, transparent 100%)',
                            animation: 'pulseGlow 5s ease-in-out infinite reverse'
                        }}
                    />
                </div>
            </div>

            <main className="flex-grow flex flex-col items-center justify-start pt-36 pb-20 px-6 z-10 relative w-full">
                <div className="w-full max-w-5xl mx-auto mb-8">
                    <div className="bg-purple-500/20 border border-purple-400/40 text-purple-300 rounded-md px-4 py-3 text-center text-lg font-semibold mb-6 animate-pulse">
                        Trade history and analytics coming soon!
                    </div>
                </div>

                <div>
                    <div className="absolute top-[120px] md:top-[20px] left-[280px] md:left-[520px] transform translate-x-[-50%] animate-float translate-y-[-50%] opacity-50 z-[-1]">
                        <div className="relative">
                            {/* Main small sphere */}
                            <div
                                className="w-24 h-24 md:w-32 md:h-32 rounded-full relative"
                                style={{
                                    background: 'radial-gradient(circle at 30% 30%, #a855f7, #7c3aed, #5b21b6, #3730a3)',
                                    boxShadow: '0 0 40px rgba(168, 85, 247, 0.6), 0 0 80px rgba(168, 85, 247, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.1)',
                                    animation: 'sphereGlow 4s ease-in-out infinite alternate'
                                }}
                            >
                                {/* Inner highlight */}
                                <div
                                    className="absolute top-2 left-2 w-4 h-4 rounded-full"
                                    style={{
                                        background: 'radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, transparent 70%)',
                                        filter: 'blur(2px)'
                                    }}
                                />
                            </div>

                            {/* Outer glow rings */}
                            <div
                                className="absolute inset-0 w-24 h-24 md:w-32 md:h-32 rounded-full"
                                style={{
                                    background: 'radial-gradient(circle, transparent 40%, rgba(168, 85, 247, 0.3) 70%, transparent 100%)',
                                    animation: 'pulseGlow 3s ease-in-out infinite'
                                }}
                            />

                            {/* Larger outer glow */}
                            <div
                                className="absolute inset-0 w-32 h-32 md:w-40 md:h-40 rounded-full -translate-x-4 -translate-y-4"
                                style={{
                                    background: 'radial-gradient(circle, transparent 50%, rgba(168, 85, 247, 0.2) 80%, transparent 100%)',
                                    animation: 'pulseGlow 5s ease-in-out infinite reverse'
                                }}
                            />
                        </div>
                    </div>
                    <div className="absolute top-[120px] md:top-[700px] left-[280px] md:left-[1200px] transform translate-x-[-50%] animate-float translate-y-[-50%] opacity-70 z-[-1]">
                        <div className="relative">
                            {/* Main small sphere */}
                            <div
                                className="w-24 h-24 md:w-32 md:h-32 rounded-full relative"
                                style={{
                                    background: 'radial-gradient(circle at 30% 30%, #a855f7, #7c3aed, #5b21b6, #3730a3)',
                                    boxShadow: '0 0 40px rgba(168, 85, 247, 0.6), 0 0 80px rgba(168, 85, 247, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.1)',
                                    animation: 'sphereGlow 4s ease-in-out infinite alternate'
                                }}
                            >
                                {/* Inner highlight */}
                                <div
                                    className="absolute top-2 left-2 w-4 h-4 rounded-full"
                                    style={{
                                        background: 'radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, transparent 70%)',
                                        filter: 'blur(2px)'
                                    }}
                                />
                            </div>

                            {/* Outer glow rings */}
                            <div
                                className="absolute inset-0 w-24 h-24 md:w-32 md:h-32 rounded-full"
                                style={{
                                    background: 'radial-gradient(circle, transparent 40%, rgba(168, 85, 247, 0.3) 70%, transparent 100%)',
                                    animation: 'pulseGlow 3s ease-in-out infinite'
                                }}
                            />

                            {/* Larger outer glow */}
                            <div
                                className="absolute inset-0 w-32 h-32 md:w-40 md:h-40 rounded-full -translate-x-4 -translate-y-4"
                                style={{
                                    background: 'radial-gradient(circle, transparent 50%, rgba(168, 85, 247, 0.2) 80%, transparent 100%)',
                                    animation: 'pulseGlow 5s ease-in-out infinite reverse'
                                }}
                            />
                        </div>
                    </div>
                </div>

                <h1 className="text-4xl md:text-6xl font-bold mb-6 py-1 text-center leading-tight bg-gradient-to-r from-[white] via-[#ffffff] to-[#ffffff] text-transparent bg-clip-text opacity-0 animate-slideInTop delay-[400ms]">
                    Trading Dashboard
                </h1>

                {loading ? (
                    <div className="text-white/70 text-lg">Loading trading data...</div>
                ) : (
                    <div className="w-full max-w-6xl bg-white/5 backdrop-blur-md border border-white/30 rounded-2xl p-20 text-white shadow-xl">
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
                                    <h3 className="text-xl font-semibold mb-4">Your Agents</h3>
                                    <p className="text-3xl font-bold text-purple-400">{agents.length}</p>
                                    <p className="text-white/60 text-sm">Total Active Agents</p>
                                </div>

                                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
                                    <h3 className="text-xl font-semibold mb-4">Total Investment</h3>
                                    <p className="text-3xl font-bold text-green-400">
                                        {agents.reduce((total, agent) => total + parseFloat(ethers.formatEther(agent.amountInvested)), 0).toFixed(2)} ETH
                                    </p>
                                    <p className="text-white/60 text-sm">Across All Agents</p>
                                </div>

                                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
                                    <h3 className="text-xl font-semibold mb-4">Active Platforms</h3>
                                    <p className="text-3xl font-bold text-blue-400">
                                        {new Set(agents.map(agent => getPlatformName(agent.platformType))).size}
                                    </p>
                                    <p className="text-white/60 text-sm">Different Platforms</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
                                    <h3 className="text-xl font-semibold mb-4">Token Balances</h3>
                                    <div className="space-y-3">
                                        {Object.entries(tokenBalances).map(([token, balance]) => (
                                            <div key={token} className="flex justify-between items-center">
                                                <span className="text-white/70">{token}</span>
                                                <span className="font-mono">{parseFloat(balance).toFixed(4)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
                                    <h3 className="text-xl font-semibold mb-4">Pool Information</h3>
                                    <div className="space-y-3">
                                        {Object.entries(poolData).map(([token, pool]) => (
                                            <div key={token} className="border-b border-white/10 pb-2">
                                                <h4 className="font-semibold text-purple-300">{token}</h4>
                                                {pool ? (
                                                    <div className="text-sm text-white/70 space-y-1">
                                                        <div>ETH Reserve: {parseFloat(pool.ethReserve).toFixed(4)}</div>
                                                        <div>Token Reserve: {parseFloat(pool.tokenReserve).toFixed(4)}</div>
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-red-400">Pool not available</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
                                <h3 className="text-xl font-semibold mb-4">Agent Details</h3>
                                <div className="space-y-4">
                                    {agents.map((agent, index) => (
                                        <div key={index} className="border border-white/20 rounded-lg p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-semibold">Agent {index + 1}</h4>
                                                    <p className="text-white/60 text-sm">
                                                        Platform: {getPlatformName(agent.platformType)} |
                                                        Investment: {ethers.formatEther(agent.amountInvested)} ETH
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-white/70">
                                                        {agent.tokens.length} tokens supported
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {agents.length === 0 && (
                                        <p className="text-white/60 text-center py-8">No agents found</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default TradeHistoryPage;