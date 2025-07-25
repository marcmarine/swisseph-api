/** @jsxImportSource hono/jsx */

import { Hono } from 'hono'
import type { FC, PropsWithChildren } from 'hono/jsx'
import { hc } from 'hono/client'
import sweph from 'sweph'

const app = new Hono()

const port = 1234

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
]

const bodieSymbol = ['☉', '☽', '☿', '♀', '♂', '♃', '♄', '♅', '♆', '♇']
const signSymbol = [
  '♈︎',
  '♉︎',
  '♊︎',
  '♋︎',
  '♌︎',
  '♍︎',
  '♎︎',
  '♏︎',
  '♐︎',
  '♑︎',
  '♒︎',
  '♓︎',
]

const signs = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
]

const route = app.get('/api/ephemeris', (c) => {
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

  const [, jd_ut] = julday.data
  const result = bodies.map((bodyNumber) => {
    const calc_ut = sweph.calc_ut(
      jd_ut,
      bodyNumber,
      sweph.constants.SEFLG_SPEED
    )

    const [longitude] = calc_ut.data
    const split_deg = sweph.split_deg(
      longitude,
      sweph.constants.SE_SPLIT_DEG_ZODIACAL
    )

    return {
      ipl: bodyNumber,
      calc_ut,
      split_deg,
    }
  })

  return c.json({
    date: date.toISOString(),
    julday: jd_ut,
    result,
  })
})

export type AppType = typeof route
const client = hc<AppType>(`http://localhost:${port}`)

const Layout: FC = ({ children }: PropsWithChildren) => {
  return (
    <html>
      <head>
        <title>Swiss Ephemeris Online</title>
        <link href="https://unpkg.com/varvara-css" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}

app.get('/', async (c) => {
  const date = c.req.query('date') ?? new Date().toISOString()

  const response = await client.api.ephemeris.$get({
    query: {
      date,
    },
  })
  const ephemeris = await response.json()

  const getPlanetName = (number: string | number) =>
    sweph.get_planet_name(Number(number))

  return c.html(
    <Layout>
      <header>
        <h1>Ephemeris</h1>
      </header>
      <main>
        <form class="va-button-group va-button-group--horizontal">
          <input
            class="va-input"
            type="datetime-local"
            name="date"
            value={date}
          />
          <input class="va-input" type="submit" value="Calculate" />
        </form>
        <h2>{new Date(date).toUTCString()} (UTC)</h2>
        <table class="va-table">
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
            {ephemeris.result.map((data) => {
              const speedLongitude = Number(data.calc_ut.data[3].toFixed(6))
              return (
                <tr>
                  <td>
                    {getPlanetName(data.ipl)} {bodieSymbol[data.ipl]}
                  </td>
                  <td>{signs[data.split_deg.sign]} </td>
                  <td>
                    {data.split_deg.degree}
                    {signSymbol[data.split_deg.sign]}
                    {data.split_deg.minute}'{data.split_deg.second}"
                    {Boolean(speedLongitude < 0) && 'r'}
                  </td>
                  <td>{data.calc_ut.data[0].toFixed(6)}</td>
                  <td>{speedLongitude}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </main>
      <footer>
        <p>
          <a href="https://github.com/marcmarine/swisseph-api" class="va-link">
            Repository on GitHub
          </a>
        </p>
      </footer>
    </Layout>
  )
})

export default {
  port,
  fetch: app.fetch,
}
