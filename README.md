# Swiss Ephemeris API

An example implementation of the [Swiss Ephemeris](https://github.com/aloistr/swisseph) library in JavaScript and TypeScript for astronomical calculations.

## Description

This project demonstrates how to integrate and use the Swiss Ephemeris library through a JavaScript API using modern tools.

## Get Started

```bash
bun install
bun dev
```

> **Note for Intel-based Macs:** If you are using a Mac without an Apple Silicon chip, you need to rebuild the native module manually because `@swisseph/node` does not provide a prebuild for this architecture:
>
> ```bash
> cd node_modules/@swisseph/node && npm run build
> ```

Visit [http://localhost:1234](http://localhost:1234) to view the project.

### Workspaces

This project uses [Bun workspaces](https://bun.sh/docs/install/workspaces). The root contains the server, and the `client` folder contains a browser-based example.

Available scripts:

- `bun dev` — Start the server in development mode.
- `bun run dev:client` — Start the client workspace in development mode. _(Due to a Bun workaround, use `start:client` for now.)_
- `bun run dev:all` — Start both the server and client in parallel.
- `bun run start:client` — Build and serve the client workspace.

### Browser Example

The `client/dist` folder contains a built example of using the **Swiss Ephemeris directly in the browser** via [`@swisseph/browser`](https://github.com/swisseph-js/swisseph). It demonstrates how to perform astronomical calculations on the client side without a server 🚀.

### Docker

Build the Docker image:

```bash
docker build --pull -t swisseph-api .
```

Run the container:

```bash
docker run -p 3000:3000 swisseph-api
```

## Versions

- **Current**: Uses [@swisseph/node](https://github.com/swisseph-js/swisseph) for astronomical calculations.
- **v1 (sweph)**: The first version used the [sweph](https://github.com/timotejroiko/sweph) library by [timotejroiko](https://github.com/timotejroiko). See the [`sweph-version`](https://github.com/marcmarine/swisseph-api/tree/sweph-version) branch.

## License

This project uses the Swiss Ephemeris library, subject to [AGPL-3.0](LICENSE).

## Credits

Astrodienst AG for the original [Swiss Ephemeris](https://github.com/aloistr/swisseph) library.

[timotejroiko](https://github.com/timotejroiko) for the original JavaScript binding of Swiss Ephemeris.

[@swisseph/node](https://github.com/swisseph-js/swisseph) for the current JavaScript/TypeScript binding of Swiss Ephemeris.

This project was bootstrapped with [Bun](https://bun.com/docs/installation).
