FROM oven/bun:latest AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM oven/bun:latest
WORKDIR /app
COPY --from=deps /app/node_modules node_modules
COPY server.tsx .
USER bun
EXPOSE 1234
CMD ["bun", "server.tsx"]
