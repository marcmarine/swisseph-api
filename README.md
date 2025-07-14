# Swiss Ephemeris API

A didactic implementation example of the [swisseph](https://github.com/timotejroiko/sweph) library in JavaScript for astronomical calculations.

## Description

This project demonstrates how to integrate and use the Swiss Ephemeris library through a JavaScript API using Hono/Express.

## Get Started

```bash
bun install
bun prepare:sweph
bun dev
```

Visit [http://localhost:1234](http://localhost:1234) to view the project.

### Docker

Build the Docker image:

```bash
docker build --pull -t swisseph-api .
```

Run the container:

```bash
docker run -p 3000:3000 swisseph-api
```

## License

This project uses the Swiss Ephemeris library, subject to [AGPL-3.0](LICENSE).

## Credits

Astrodienst AG for the original [Swiss Ephemeris](https://github.com/aloistr/swisseph) library.

[timotejroiko](https://github.com/timotejroiko) for the JavaScript binding of Swiss Ephemeris.

This project was bootstrapped with [Hono](hhttps://hono.dev/docs/getting-started/bun).
