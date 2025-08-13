FROM node:22-bullseye
WORKDIR /app

COPY package*.json ./
# Use lockfile when available, fallback to install if missing
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY . .
RUN npx hardhat compile

CMD ["npx","hardhat","node"]
