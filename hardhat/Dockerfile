FROM node:22
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx hardhat compile
CMD ["npx","hardhat","node"]
