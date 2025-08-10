# KB Future Finance AI Challenge

This project uses Docker Compose to run the Nuxt application and related services.

## Environment Variables

Define required variables in `.env.development` or `.env.production` depending on the environment:

- `CHAIN_RPC_URL` – RPC endpoint for the blockchain network
- `JWT_SECRET` – secret key for signing tokens
- `ML_SERVICE_URL` – URL for the machine learning service

## Development

```bash
docker compose -f docker-compose.dev.yml up --build
```

The development configuration starts both the Nuxt app and a local Hardhat node.

## Production

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

The production configuration runs only the Nuxt app and expects external services.
