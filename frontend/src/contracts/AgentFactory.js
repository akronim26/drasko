const AGENT_FACTORY_CONTRACT_ADDRESS = '0xCe28C5F9E8554e2498F859dd3F766D64a5Debe56';
const AGENT_FACTORY_CONTRACT_ABI = [
    {
        "type": "function",
        "name": "createAgent",
        "inputs": [
            {
                "name": "_tokens",
                "type": "address[]",
                "internalType": "address[]"
            },
            {
                "name": "_platformType",
                "type": "uint8",
                "internalType": "enum Platform"
            },
            {
                "name": "authorizedSigner",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "_mockAMM",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "contract Agent"
            }
        ],
        "stateMutability": "payable"
    },
    {
        "type": "function",
        "name": "getAgentInfo",
        "inputs": [
            {
                "name": "user",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "index",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "tuple",
                "internalType": "struct AgentFactory.AgentInfo",
                "components": [
                    {
                        "name": "agentAddress",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "owner",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "tokens",
                        "type": "address[]",
                        "internalType": "address[]"
                    },
                    {
                        "name": "amountInvested",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "platformType",
                        "type": "uint8",
                        "internalType": "enum Platform"
                    }
                ]
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "userToAgents",
        "inputs": [
            {
                "name": "user",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "agentAddress",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "owner",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "amountInvested",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "platformType",
                "type": "uint8",
                "internalType": "enum Platform"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "event",
        "name": "Factory__AgentCreated",
        "inputs": [
            {
                "name": "agentAddress",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "platform",
                "type": "uint8",
                "indexed": true,
                "internalType": "enum Platform"
            },
            {
                "name": "tokens",
                "type": "address[]",
                "indexed": true,
                "internalType": "address[]"
            }
        ],
        "anonymous": false
    },
    {
        "type": "error",
        "name": "Factory__AmountIsZero",
        "inputs": []
    },
    {
        "type": "error",
        "name": "Factory__NoTokenPresent",
        "inputs": []
    },
    {
        "type": "error",
        "name": "Factory__PlatformNotAvailable",
        "inputs": []
    }
];

export {AGENT_FACTORY_CONTRACT_ADDRESS, AGENT_FACTORY_CONTRACT_ABI}