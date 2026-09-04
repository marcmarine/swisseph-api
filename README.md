# Swiss Ephemeris API

An example implementation of the [Swiss Ephemeris](https://github.com/aloistr/swisseph) library in JavaScript and TypeScript for astronomical calculations.

## Description

This project demonstrates how to integrate and use the Swiss Ephemeris library through a JavaScript API using modern tools.

## Get Started

```bash
bun install
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
