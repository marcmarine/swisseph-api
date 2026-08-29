import { renderToReadableStream } from "react-dom/server";
import sweph from "sweph";

const port = 1234;

const bodies = [
	sweph.constants.SE_SUN,
	sweph.constants.SE_MOON,
	sweph.constants.SE_MERCURY,
	sweph.constants.SE_VENUS,
	sweph.constants.SE_MARS,
	sweph.constants.SE_JUPITER,
	sweph.constants.SE_SATURN,
	sweph.constants.SE_URANUS,
	sweph.constants.SE_NEPTUNE,
	sweph.constants.SE_PLUTO,
];

const bodieSymbol = ["☉", "☽", "☿", "♀", "♂", "♃", "♄", "♅", "♆", "♇"];
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

function getEphemeris(dateQueryParam: string | null) {
	const date = dateQueryParam ? new Date(dateQueryParam) : new Date();

	const julday = sweph.julday(
		date.getUTCFullYear(),
		date.getUTCMonth() + 1,
		date.getUTCDate(),
		date.getUTCHours() + date.getUTCMinutes() / 60,
		sweph.constants.SE_GREG_CAL,
	);

	const result = bodies.map((bodyNumber) => {
		const calc_ut = sweph.calc_ut(
			julday,
			bodyNumber,
			sweph.constants.SEFLG_SPEED,
		);
		console.log(calc_ut);
		const [longitude] = calc_ut.data;
		const split_deg = sweph.split_deg(
			longitude,
			sweph.constants.SE_SPLIT_DEG_ZODIACAL,
		);

		return {
			ipl: bodyNumber,
			calc_ut,
			split_deg,
		};
	});

	return {
		date: date.toISOString(),
		julday,
		result,
	};
}

const getPlanetName = (number: string | number) =>
	sweph.get_planet_name(Number(number));

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
							value={escapeHtml(props.date)}
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
								const speedLongitude = Number(data.calc_ut.data[3].toFixed(6));
								return (
									<tr key={data.ipl}>
										<td>
											{getPlanetName(data.ipl)} {bodieSymbol[data.ipl]}
										</td>
										<td>{signs[data.split_deg.sign]}</td>
										<td>
											{data.split_deg.degree}
											{signSymbol[data.split_deg.sign]}
											{data.split_deg.minute}'{data.split_deg.second}"
											{speedLongitude < 0 ? "r" : ""}
										</td>
										<td>{data.calc_ut.data[0].toFixed(6)}</td>
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
