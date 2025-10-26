#!/bin/bash

# Disable local LLM services
export USE_LOCAL_LLM=false
export USE_OLLAMA=false
export USE_LLAMA=false
export OLLAMA_EMBEDDING_MODEL=""
export USE_OPENAI_EMBEDDING="false"

# Run the bot
npm run dev 