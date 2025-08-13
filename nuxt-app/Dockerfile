# Stage 1: Build Stage
FROM node:22-bullseye AS build
WORKDIR /app

# Install build tools for native addons
RUN apt-get update && apt-get install -y python3 build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies with root permissions for scripts
COPY package*.json ./
RUN npm ci --unsafe-perm

# Copy source and build application
COPY . .
RUN npm run build

# Remove dev dependencies for production
RUN npm prune --production

# Stage 2: Runtime Stage
FROM node:22-bullseye-slim AS runtime
WORKDIR /app

# Copy built output and production dependencies
COPY --from=build /app/.output ./.output
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

ENV NODE_ENV=production
EXPOSE 3000

# Start Nuxt application
CMD ["node", ".output/server/index.mjs"]
