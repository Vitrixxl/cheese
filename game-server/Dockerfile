FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies for all packages
COPY package.json bun.lock ./
COPY shared/package.json ./shared/
COPY game-server/package.json ./game-server/

RUN bun install --frozen-lockfile

# Copy source code
COPY shared ./shared
COPY game-server ./game-server

# Set working directory to game-server
WORKDIR /app/game-server

# Expose port
EXPOSE 3001

# Run the application
CMD ["bun", "src/index.ts"]
