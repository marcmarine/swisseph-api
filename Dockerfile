FROM oven/bun:latest AS base
WORKDIR /usr/src/app

FROM base AS install

RUN apt-get update && \
    apt-get install -y python3 make g++ && \
    rm -rf /var/lib/apt/lists/*
    
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

RUN cd /temp/prod/node_modules/sweph && bun install

FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/server.tsx .

USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "server.tsx" ]