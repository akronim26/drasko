import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AgentControlBox from "../components/AgentControlBox";
import AgentCard from "./AgentCard";
import { useWalletConnection } from "../hooks/useWalletConnection.js";
import { getUserAgents, getAgentPausedState, getAgentFunds } from "../utils/AgentInteractions.js";
import { getTokenBalance, getTokenSymbol } from "../utils/TokenUtils.js";
import { toast } from "react-toastify";
import { ethers } from "ethers";
import TransactionProcessingModal from "../components/TransactionProcessingModal";

const ProfilePage = () => {
    const { address, signer } = useWalletConnection();
    const [agents, setAgents] = useState([]);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showProcessing, setShowProcessing] = useState(false);

    const loadUserAgents = useCallback(async () => {
        try {
            setLoading(true);
            const userAgents = await getUserAgents(address, signer);
            const agentsWithDetails = await Promise.all(
                userAgents.map(async (agentInfo, index) => {
                    const isPaused = await getAgentPausedState(agentInfo.agentAddress, signer);
                    const funds = await getAgentFunds(agentInfo.agentAddress, signer);

                    const tokenDetails = await Promise.all(
                        agentInfo.tokens.map(async (tokenAddress) => {
                            try {
                                const symbol = await getTokenSymbol(tokenAddress, signer);
                                const balance = await getTokenBalance(tokenAddress, agentInfo.agentAddress, signer);
                                return {
                                    address: tokenAddress,
                                    symbol: symbol,
                                    balance: balance
                                };
                            } catch (error) {
                                console.error(`Error getting token details for ${tokenAddress}:`, error);
                                return {
                                    address: tokenAddress,
                                    symbol: 'Unknown',
                                    balance: '0'
                                };
                            }
                        })
                    );

                    return {
                        id: index,
                        name: `Agent ${index + 1}`,
                        description: `Platform: ${getPlatformName(agentInfo.platformType)}`,
                        paused: isPaused,
                        address: agentInfo.agentAddress,
                        platformType: agentInfo.platformType,
                        amountInvested: ethers.formatEther(agentInfo.amountInvested),
                        currentFunds: funds,
                        tokens: agentInfo.tokens,
                        tokenDetails: tokenDetails
                    };
                })
            );
            setAgents(agentsWithDetails.reverse());
        } catch (error) {
            console.error("Error loading agents:", error);
            toast.error("Failed to load agents");
        } finally {
            setLoading(false);
        }
    }, [address, signer]);

    useEffect(() => {
        if (address && signer) {
            loadUserAgents();
        }
    }, [loadUserAgents, address, signer]);

    const getPlatformName = (platformType) => {
        switch (platformType) {
            case 0: return "Telegram";
            case 1: return "Twitter";
            case 2: return "Discord";
            default: return "Unknown";
        }
    };

    const handleAgentUpdate = () => {
        loadUserAgents();
    };

    // Remove agent from UI immediately after suspension
    const handleAgentSuspended = (agentAddress) => {
        setAgents(prev => prev.filter(a => a.address !== agentAddress));
        setSelectedAgent(null);
    };

    // Set agent display to zero after suspension (if modal is still open)
    const handleZeroAgentDisplay = (agentAddress) => {
        setAgents(prev => prev.map(a => a.address === agentAddress ? {
            ...a,
            currentFunds: "0",
            tokenDetails: a.tokenDetails.map(t => ({ ...t, balance: "0" }))
        } : a));
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#000000] overflow-hidden relative">
            <Navbar />
            {showProcessing && <TransactionProcessingModal />}

            <div className="absolute bottom-0 left-[10px] md:left-[1350px] transform translate-x-[-20%] animate-float translate-y-[40%] opacity-70 z-[1]">
                <div className="relative">
                    <div
                        className="w-80 h-80 rounded-full relative"
                        style={{
                            background: 'radial-gradient(circle at 30% 30%, #a855f7, #7c3aed, #5b21b6, #3730a3)',
                            boxShadow: '0 0 100px rgba(168, 85, 247, 0.8), 0 0 200px rgba(168, 85, 247, 0.4), inset 0 0 60px rgba(255, 255, 255, 0.1)',
                            animation: 'sphereGlow 4s ease-in-out infinite alternate'
                        }}
                    >
                        <div
                            className="absolute top-8 left-8 w-16 h-16 rounded-full"
                            style={{
                                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, transparent 70%)',
                                filter: 'blur(4px)'
                            }}
                        />
                        <div
                            className="absolute top-12 left-12 w-8 h-8 rounded-full"
                            style={{
                                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 80%)',
                                filter: 'blur(2px)'
                            }}
                        />
                    </div>
                    <div
                        className="absolute inset-0 w-80 h-80 rounded-full animate-pulse"
                        style={{
                            background: 'radial-gradient(circle, transparent 40%, rgba(168, 85, 247, 0.3) 70%, transparent 100%)',
                            animation: 'pulseGlow 3s ease-in-out infinite'
                        }}
                    />
                    <div
                        className="absolute inset-0 w-96 h-96 rounded-full -translate-x-8 -translate-y-8"
                        style={{
                            background: 'radial-gradient(circle, transparent 0%, rgba(168, 85, 247, 0.2) 80%, transparent 100%)',
                            animation: 'pulseGlow 5s ease-in-out infinite reverse'
                        }}
                    />
                </div>
            </div>

            <iframe
                src="https://sincere-polygon-333639.framer.app/404-2"
                className="absolute top-0 left-40 w-[150vw] h-[150vh] scale-[1.2] z-[0]"
                frameBorder="0"
                allowFullScreen
            />

            <main className="flex-grow flex items-center justify-center pt-32 pb-20 relative z-10 px-4">
                <div className="absolute top-[120px] md:top-[80px] left-[280px] md:left-[850px] transform translate-x-[-50%] animate-float translate-y-[-50%] opacity-80 z-[-1]">
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
                <div className="w-full max-w-6xl bg-white/5 backdrop-blur-md border border-white/30 rounded-2xl p-20 text-white shadow-xl">

                    <div className="flex flex-col items-center text-center mb-8">
                        <img
                            src="https://api.dicebear.com/7.x/bottts-neutral/svg?seed=avatar"
                            alt="Profile Avatar"
                            className="w-32 h-32 rounded-full border-4 border-white shadow-md"
                        />
                        <div className="mt-4 bg-white text-black px-4 py-2 rounded-md text-sm inline-block">
                            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not Connected"}
                        </div>
                        <a
                            href={address ? `https://etherscan.io/address/${address}` : "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-400 text-sm py-4 underline hover:text-purple-300"
                        >
                            View on Etherscan ↗
                        </a>
                    </div>

                    <div className="space-y-8 text-white/90 text-[20px] text-sm">
                        <div>
                            <h3 className="text-[30px] font-semibold text-purple-300 mb-10">Your Agents</h3>
                            {loading ? (
                                <p className="text-white/60">Loading agents...</p>
                            ) : agents.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {agents.map((agent) => (
                                        <AgentCard
                                            key={agent.id}
                                            agent={agent}
                                            onClick={setSelectedAgent}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-white/60">No agents created yet.</p>
                            )}

                            {selectedAgent && (
                                <AgentControlBox
                                    agent={selectedAgent}
                                    onClose={() => setSelectedAgent(null)}
                                    onAgentUpdate={handleAgentUpdate}
                                    onAgentSuspended={handleAgentSuspended}
                                    onZeroAgentDisplay={handleZeroAgentDisplay}
                                    setShowProcessing={setShowProcessing}
                                />
                            )}
                        </div>
                    </div>
                </div>

            </main >

            <Footer />
        </div >
    );
};

export default ProfilePage;