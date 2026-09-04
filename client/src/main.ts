import { Planet, SwissEphemeris } from "@swisseph/browser";

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

function $<T extends Element = HTMLElement>(
	selector: string,
	root: ParentNode = document,
): T {
	const element = root.querySelector<T>(selector);
	if (!element) {
		throw new Error(`Element not found: ${selector}`);
	}
	return element;
}

const statusEl = $("#status");
const tableEl = $<HTMLTableElement>("#ephemeris-table");
const tbodyEl = $("tbody", tableEl);
const dateDisplayEl = $<HTMLHeadingElement>("#date-display");
const dateInput = $<HTMLInputElement>("#date-input");
const form = $<HTMLFormElement>("#date-form");

const swe = new SwissEphemeris();

function getDateParamFromUrl(): string | null {
	return new URL(window.location.href).searchParams.get("date");
}

function updateUrl(value: string, replace: boolean) {
	const url = new URL(window.location.href);
	url.searchParams.set("date", value);
	const method = replace ? "replaceState" : "pushState";
	window.history[method](null, "", url);
}

async function init() {
	await swe.init();
	statusEl.hidden = true;
	tableEl.hidden = false;

	const now = new Date();
	const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
		.toISOString()
		.slice(0, 16);

	dateInput.value = getDateParamFromUrl() ?? localNow;
	render(dateInput.value ? new Date(dateInput.value) : new Date());
	updateUrl(dateInput.value, true);
}

function render(date: Date) {
	const jd = swe.dateToJulianDay(date);
	tbodyEl.innerHTML = "";

	bodies.forEach((body, index) => {
		const position = swe.calculatePosition(jd, body);
		const splitDeg = splitLongitude(position.longitude);
		const speedLongitude = Number(position.longitudeSpeed.toFixed(6));

		const row = document.createElement("tr");
		row.innerHTML = `
      <td>${bodyNames[index]} ${bodySymbol[index]}</td>
      <td>${signs[splitDeg.sign]}</td>
      <td>${splitDeg.degree}${signSymbol[splitDeg.sign]}${splitDeg.minute}'${splitDeg.second}"${speedLongitude < 0 ? "r" : ""}</td>
      <td>${position.longitude.toFixed(6)}</td>
      <td>${speedLongitude}</td>
    `;
		tbodyEl.appendChild(row);
	});

	dateDisplayEl.textContent = `${date.toUTCString()} (UTC)`;
	dateDisplayEl.hidden = false;
}

form.addEventListener("submit", (event: SubmitEvent) => {
	event.preventDefault();
	const value = dateInput.value ? new Date(dateInput.value) : new Date();
	render(value);
	updateUrl(dateInput.value, false);
});

window.addEventListener("popstate", () => {
	const value = getDateParamFromUrl();
	if (!value) return;
	dateInput.value = value;
	render(new Date(value));
});

init();
