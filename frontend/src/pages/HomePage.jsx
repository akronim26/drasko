import React from "react";
import Spline from "@splinetool/react-spline";
import Navbar from "../components/Navbar";

const HomePage = () => {
    return (
        <div className="relative min-h-screen flex flex-col md:flex-row items-center justify-between px-6 md:px-16 pt-50% pb-12 bg-[#000000] overflow-hidden">

            <Navbar />
            <div className="absolute inset-0 overflow-hidden z-0">

                <iframe
                    src="https://sincere-polygon-333639.framer.app/404-2"
                    className="absolute top-[-1] left-70 w-[150vw] h-[150vh] scale-[1.2] z-[0]"
                    frameBorder="0"
                    allowFullScreen
                />

            </div>
            <div className="absolute top-0 left-0 w-80 h-80 bg-purple-700 opacity-10 blur-[120px] rounded-full z-10"></div>
            <div className="absolute bottom-16 right-8 w-96 h-96 bg-[#bb6ea8] opacity-30 blur-[160px] rounded-full z-10"></div>

            <div className="absolute bottom-8 left-[1400px] transform translate-x-[-20%] translate-y-[40%] opacity-70 z-[1]">
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
            <div className="absolute top-[120px] md:top-[10px] left-[280px] md:left-[600px] transform translate-x-[-50%] translate-y-[-50%] animate-float opacity-70 z-[1]">
                <div className="relative">
                    <div
                        className="w-24 h-24 md:w-32 md:h-32 rounded-full relative"
                        style={{
                            background: 'radial-gradient(circle at 30% 30%, #a855f7, #7c3aed, #5b21b6, #3730a3)',
                            boxShadow: '0 0 40px rgba(168, 85, 247, 0.6), 0 0 80px rgba(168, 85, 247, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.1)',
                            animation: 'sphereGlow 4s ease-in-out infinite alternate'
                        }}
                    >
                        <div
                            className="absolute top-2 left-2 w-4 h-4 rounded-full"
                            style={{
                                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, transparent 70%)',
                                filter: 'blur(2px)'
                            }}
                        />
                    </div>
                    <div
                        className="absolute inset-0 w-24 h-24 md:w-32 md:h-32 rounded-full"
                        style={{
                            background: 'radial-gradient(circle, transparent 40%, rgba(168, 85, 247, 0.3) 70%, transparent 100%)',
                            animation: 'pulseGlow 3s ease-in-out infinite'
                        }}
                    />
                    <div
                        className="absolute inset-0 w-32 h-32 md:w-40 md:h-40 rounded-full -translate-x-4 -translate-y-4"
                        style={{
                            background: 'radial-gradient(circle, transparent 50%, rgba(168, 85, 247, 0.2) 80%, transparent 100%)',
                            animation: 'pulseGlow 5s ease-in-out infinite reverse'
                        }}
                    />
                </div>
            </div>
            <div className="flex-1 px-6 z-10 relative">

                <h1 className="text-6xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-[#ffffff] via-[#d1bbe8] to-[#8a5bbd] text-transparent bg-clip-text opacity-0 animate-slideInRight delay-[10ms]">
                    Create Your Own
                </h1>
                <h1 className="text-6xl md:text-7xl font-bold mb-6 py-2 bg-gradient-to-r from-[#ffffff] via-[#d1bbe8] to-[#8a5bbd] text-transparent bg-clip-text opacity-0 animate-slideInRight delay-[10ms]">
                    AI Trading Agent
                </h1>
                <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-xl opacity-0 animate-slideInLeft delay-[1200ms]">
                    From idea to execution — build AI agents that operate autonomously, transparently, and securely in the decentralized economy.
                </p>
                <a
                    href="/create-agent"
                    className="bg-white text-black px-6 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition opacity-0 animate-slideInBottom delay-[800ms]">
                    GET STARTED
                </a>
            </div>

            <div className="relative flex justify-end w-full md:w-[55%] h-[600px] md:h-[700px] z-10 overflow-visible">
                <div className="scale-[1.2] translate-x-6 md:translate-x-44 md:translate-y-12 w-[100%] h-full">
                    <Spline scene="https://prod.spline.design/bBZhaOPognQ5-DAn/scene.splinecode" />
                </div>
            </div>
        </div>
    );
};

export default HomePage;