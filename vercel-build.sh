#!/bin/bash

# Clean any existing .next directory
rm -rf .next

# Install dependencies with legacy deps flag
npm install --legacy-deps

# Build the Next.js application
npm run build