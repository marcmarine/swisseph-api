import { calculatePosition, dateToJulianDay, Planet } from "@swisseph/node";
import { renderToReadableStream } from "react-dom/server";

const port = 1234;

const bodies = [
	Planet.Sun,
	Planet.Moon,
	Planet.Mercury,
	Planet.Venus,
	Planet.Mars,
	Planet.Jupiter,
	Planet.Saturn,
	Planet.Uranus,
	Planet.Neptune,
	Planet.Pluto,
];

const bodyNames = [
	"Sun",
	"Moon",
	"Mercury",
	"Venus",
	"Mars",
	"Jupiter",
	"Saturn",
	"Uranus",
	"Neptune",
	"Pluto",
];
const bodySymbol = ["☉", "☽", "☿", "♀", "♂", "♃", "♄", "♅", "♆", "♇"];
const signSymbol = [
	"♈︎",
	"♉︎",
	"♊︎",
	"♋︎",
	"♌︎",
	"♍︎",
	"♎︎",
	"♏︎",
	"♐︎",
	"♑︎",
	"♒︎",
	"♓︎",
];
const signs = [
	"Aries",
	"Taurus",
	"Gemini",
	"Cancer",
	"Leo",
	"Virgo",
	"Libra",
	"Scorpio",
	"Sagittarius",
	"Capricorn",
	"Aquarius",
	"Pisces",
];

// @swisseph/node does not provide an equivalent to sweph.split_deg,
// so we convert the ecliptic longitude to sign/degree/minute/second ourselves.
function splitLongitude(longitude: number) {
	const norm = ((longitude % 360) + 360) % 360;
	const sign = Math.floor(norm / 30);
	const degreeInSign = norm - sign * 30;
	const degree = Math.floor(degreeInSign);
	const minuteFull = (degreeInSign - degree) * 60;
	const minute = Math.floor(minuteFull);
	const second = Math.round((minuteFull - minute) * 60);
	return { sign, degree, minute, second };
}

function getEphemeris(dateQueryParam: string | null) {
	const date = dateQueryParam ? new Date(dateQueryParam) : new Date();
	const julday = dateToJulianDay(date);

	const result = bodies.map((body, index) => {
		const position = calculatePosition(julday, body);
		const splitDeg = splitLongitude(position.longitude);
		return { index, position, splitDeg };
	});

	return { date: date.toISOString(), julday, result };
}

function escapeHtml(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}

function Page(props: {
	date: string;
	ephemeris: ReturnType<typeof getEphemeris>;
}) {
	return (
		<html lang="en">
			<head>
				<title>Swiss Ephemeris Online</title>
				<link href="https://unpkg.com/varvara-css" rel="stylesheet" />
			</head>
			<body>
				<header>
					<h1>Ephemeris</h1>
				</header>
				<main>
					<form className="va-button-group va-button-group--horizontal">
						<input
							className="va-input"
							type="datetime-local"
							name="date"
							defaultValue={escapeHtml(props.date)}
						/>
						<input className="va-input" type="submit" value="Calculate" />
					</form>
					<h2>{new Date(props.date).toUTCString()} (UTC)</h2>
					<table className="va-table">
						<thead>
							<tr>
								<th></th>
								<th>Sign</th>
								<th>DMS</th>
								<th>Longitude</th>
								<th>Speed Longitude</th>
							</tr>
						</thead>
						<tbody>
							{props.ephemeris.result.map((data) => {
								const speedLongitude = Number(
									data.position.longitudeSpeed.toFixed(6),
								);
								return (
									<tr key={data.index}>
										<td>
											{bodyNames[data.index]} {bodySymbol[data.index]}
										</td>
										<td>{signs[data.splitDeg.sign]}</td>
										<td>
											{data.splitDeg.degree}
											{signSymbol[data.splitDeg.sign]}
											{data.splitDeg.minute}'{data.splitDeg.second}"
											{speedLongitude < 0 ? "r" : ""}
										</td>
										<td>{data.position.longitude.toFixed(6)}</td>
										<td>{speedLongitude}</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</main>
				<footer>
					<p>
						<a
							href="https://github.com/marcmarine/swisseph-api"
							className="va-link"
						>
							Repository on GitHub
						</a>
					</p>
				</footer>
			</body>
		</html>
	);
}

const server = Bun.serve({
	port,
	routes: {
		"/api/ephemeris": (req) => {
			const date = new URL(req.url).searchParams.get("date");
			return Response.json(getEphemeris(date));
		},
		"/": async (req) => {
			const date =
				new URL(req.url).searchParams.get("date") ?? new Date().toISOString();
			const ephemeris = getEphemeris(date);
			const stream = await renderToReadableStream(
				<Page date={date} ephemeris={ephemeris} />,
			);
			return new Response(stream, {
				headers: { "Content-Type": "text/html; charset=utf-8" },
			});
		},
	},
});

console.log(`Listening on ${server.url}`);
