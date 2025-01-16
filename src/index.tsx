import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { hc } from 'hono/client'
import swisseph from 'swisseph'

const app = new Hono()

const port = 1234

const options = [
  swisseph.SE_SUN,
  swisseph.SE_MOON,
  swisseph.SE_MERCURY,
  swisseph.SE_VENUS,
  swisseph.SE_MARS,
  swisseph.SE_JUPITER,
  swisseph.SE_SATURN,
  swisseph.SE_URANUS,
  swisseph.SE_NEPTUNE,
  swisseph.SE_PLUTO,
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

  // Conversion from day, month, year, time to Julian day.
  const julday = swisseph.swe_julday(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    date.getUTCHours(),
    swisseph.SE_GREG_CAL
  )

  const bodyNumber = Number(bodyParam) ?? swisseph.SE_SUN

  // Computes the position of a planet for a specified Universal Time.
  const calc_ut = swisseph.swe_calc_ut(julday, bodyNumber, swisseph.SEFLG_SPEED)

  // Split degrees to sign, degrees, minutes, seconds of arc.
  const split_deg = swisseph.swe_split_deg(
    (calc_ut as { longitude: number }).longitude,
    swisseph.SE_SPLIT_DEG_ZODIACAL
  )

  return c.json({
    date,
    julday,
    calc_ut,
    split_deg,
  })
})

export type AppType = typeof route
const client = hc<AppType>(`http://localhost:${port}`)

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
    swisseph.swe_get_planet_name(Number(number)).name

  return c.render(
    <html>
      <head>
        <title>Swiss Ephemeris Online</title>
      </head>
      <body>
        <h1>Swiss Ephemeris Online</h1>
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
            dms: {data.split_deg.degree}º {data.split_deg.min}'{' '}
            {data.split_deg.second}"
          </li>
          {Object.entries(data.calc_ut).map(([key, value]) => (
            <li>
              {key}: {value}
            </li>
          ))}
        </ul>
      </body>
    </html>
  )
})

console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
