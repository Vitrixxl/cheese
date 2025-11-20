FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies for all packages
COPY package.json bun.lock ./
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/

RUN bun install --frozen-lockfile

# Copy source code
COPY shared ./shared
COPY backend ./backend

# Set working directory to backend
WORKDIR /app/backend

# Expose port
EXPOSE 6969

# Run the application
CMD ["bun", "src/index.ts"]
