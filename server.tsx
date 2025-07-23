/** @jsxImportSource hono/jsx */

import { Hono } from 'hono'
import type { FC, PropsWithChildren } from 'hono/jsx'
import { hc } from 'hono/client'
import sweph from 'sweph'

const app = new Hono()

const port = 1234

const options = [
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
]

const signs = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
]

const route = app.get('/api/calculate/:seBodyNumber', (c) => {
  const bodyParam = c.req.param('seBodyNumber')
  const dateQueryParam = c.req.query('date')

  const date = dateQueryParam ? new Date(dateQueryParam) : new Date()

  const julday = sweph.utc_to_jd(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    0,
    sweph.constants.SE_GREG_CAL
  )

  const bodyNumber = Number(bodyParam) ?? sweph.constants.SE_SUN

  const [, jd_ut] = julday.data
  const calc_ut = sweph.calc_ut(jd_ut, bodyNumber, sweph.constants.SEFLG_SPEED)

  const split_deg = sweph.split_deg(
    calc_ut.data[0],
    sweph.constants.SE_SPLIT_DEG_ZODIACAL
  )

  return c.json({
    date,
    julday: jd_ut,
    calc_ut,
    split_deg,
  })
})

export type AppType = typeof route
const client = hc<AppType>(`http://localhost:${port}`)

const Layout: FC = ({ children }: PropsWithChildren) => {
  return (
    <html>
      <head>
        <title>Swiss Ephemeris Online</title>
      </head>
      <body>{children}</body>
    </html>
  )
}

app.get('/', async (c) => {
  const date = c.req.query('date')
  const bodyNumber = c.req.query('body') ?? 0

  const res = await client.api.calculate[':seBodyNumber'].$get({
    param: {
      seBodyNumber: String(bodyNumber),
    },
    // @ts-ignore
    query: {
      date,
    },
  })
  const data = await res.json()

  const getPlanetName = (number: string | number) =>
    sweph.get_planet_name(Number(number))

  return c.html(
    <Layout>
      <header>
        <h1>Swiss Ephemeris Online</h1>
        <link href="https://unpkg.com/varvara-css" rel="stylesheet" />
      </header>
      <main>
        <form>
          <fieldset>
            <input type="datetime-local" name="date" value={date} />
            <select name="body">
              {options.map((value) => (
                <option value={value} selected={value === Number(bodyNumber)}>
                  {getPlanetName(value)}
                </option>
              ))}
            </select>
            <input type="submit" value="Calculate" />
          </fieldset>
        </form>
        <h2>{getPlanetName(bodyNumber)}</h2>
        <h3>{new Date(data.date).toUTCString()}</h3>
        <ul>
          <li>sign: {signs[data.split_deg.sign]}</li>
          <li>
            dms: {data.split_deg.degree}º {data.split_deg.minute}'{' '}
            {data.split_deg.second}"
          </li>
          <li>longitude: {data.calc_ut.data[0].toFixed(6)}</li>
          <li>latitude: {data.calc_ut.data[1].toFixed(6)}</li>
          <li>distance: {data.calc_ut.data[2].toFixed(6)}</li>
          <li>speed longitude: {data.calc_ut.data[3].toFixed(6)}</li>
          <li>speed latitude: {data.calc_ut.data[4].toFixed(6)}</li>
          <li>speed distance: {data.calc_ut.data[5].toFixed(6)}</li>
          <li>julian day: {data.julday.toFixed(2)}</li>
        </ul>
      </main>
      <footer>
        <a href="https://github.com/marcmarine/swisseph-api">
          Repository on GitHub
        </a>
      </footer>
    </Layout>
  )
})

export default {
  port,
  fetch: app.fetch,
}
