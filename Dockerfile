FROM oven/bun:latest AS deps

WORKDIR /app

COPY package.json bun.lock ./

RUN apt-get update && \
    apt-get install -y python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

RUN bun install --frozen-lockfile
RUN cd ./node_modules/sweph && bun install

FROM oven/bun:latest

WORKDIR /app

COPY --from=deps /app/node_modules node_modules
COPY server.tsx .

USER bun

EXPOSE 1234
CMD ["bun", "server.tsx"]