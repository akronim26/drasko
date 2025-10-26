const MOCK_AMM_CONTRACT_ADDRESS = '0xD5eAe7d67Ce3124217f82228AF3d23402fcc8E68';
const MOCK_AMM_CONTRACT_ABI = [
    {
        "type": "receive",
        "stateMutability": "payable"
    },
    {
        "type": "function",
        "name": "addLiquidity",
        "inputs": [
            {
                "name": "token",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "tokenAmount",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "lpTokens",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "payable"
    },
    {
        "type": "function",
        "name": "getAmountOut",
        "inputs": [
            {
                "name": "tokenOut",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "ethAmount",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "amountOut",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getPool",
        "inputs": [
            {
                "name": "token",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "pool",
                "type": "tuple",
                "internalType": "struct IMockAMM.Pool",
                "components": [
                    {
                        "name": "token",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "ethReserve",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "tokenReserve",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "totalSupply",
                        "type": "uint256",
                        "internalType": "uint256"
                    }
                ]
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "pools",
        "inputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "token",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "ethReserve",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "tokenReserve",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "totalSupply",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "removeLiquidity",
        "inputs": [
            {
                "name": "token",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "lpTokens",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "ethAmount",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "tokenAmount",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "swapETHForTokens",
        "inputs": [
            {
                "name": "tokenOut",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "minAmountOut",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "amountOut",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "payable"
    },
    {
        "type": "function",
        "name": "swapTokensForETH",
        "inputs": [
            {
                "name": "tokenIn",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "amountIn",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "minAmountOut",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "amountOut",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "userLPTokens",
        "inputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "event",
        "name": "MockAMM__LiquidityAdded",
        "inputs": [
            {
                "name": "user",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "token",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "ethAmount",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "tokenAmount",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "lpTokens",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "MockAMM__LiquidityRemoved",
        "inputs": [
            {
                "name": "user",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "token",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "ethAmount",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "tokenAmount",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "lpTokens",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "MockAMM__Swap",
        "inputs": [
            {
                "name": "user",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "tokenIn",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "tokenOut",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "amountIn",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "amountOut",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "error",
        "name": "MockAMM__InsufficientETH",
        "inputs": []
    },
    {
        "type": "error",
        "name": "MockAMM__InsufficientLiquidity",
        "inputs": []
    },
    {
        "type": "error",
        "name": "MockAMM__InsufficientOutputAmount",
        "inputs": []
    },
    {
        "type": "error",
        "name": "MockAMM__InvalidToken",
        "inputs": []
    },
    {
        "type": "error",
        "name": "MockAMM__TransferFailed",
        "inputs": []
    },
    {
        "type": "error",
        "name": "ReentrancyGuardReentrantCall",
        "inputs": []
    },
    {
        "type": "error",
        "name": "SafeERC20FailedOperation",
        "inputs": [
            {
                "name": "token",
                "type": "address",
                "internalType": "address"
            }
        ]
    }
];

export {MOCK_AMM_CONTRACT_ABI, MOCK_AMM_CONTRACT_ADDRESS}