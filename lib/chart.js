function printBar (x0, x1, length) {
  let s = '['
  for (let i = 0; i < length; i++) {
    const r = i / length
    s += r >= x0 && r <= x1 ? '-' : ' '
  }
  return s + ']'
}

function printSpaces (ln, space = ' ') {
  let s = ''
  while (ln--) {
    s += space
  }
  return s
}

const CHART_LAST_ITEM = '\u2514'
const CHART_ITEM = '\u251C'

function printChart (metrics, barWidth = 50) {
  const x0 = metrics.start_ts
  const d = metrics.exec_time
  const dictionary = Object.create(null)

  ;(function recursive (stack, parent = 0) {
    stack
      .sort(({ start_ts: a }, { start_ts: b }) => a - b)
      .forEach((item, i, { length }) => {
        const last = i === length - 1
        const key = (parent ? printSpaces(parent) + (last ? CHART_LAST_ITEM : CHART_ITEM) : '') + item.path
        dictionary[key] = {
          end_ts: item.end_ts,
          start_ts: item.start_ts,
          exec_time: item.exec_time,
          bar: printBar((item.start_ts - x0) / d, (item.end_ts - x0) / d, barWidth)
        }
        item.next && recursive(item.next, parent + 1)
      })
  })(metrics.stack)

  const maxKeyLn = Object.keys(dictionary).reduce((ln, key) => key.length > ln ? key.length : ln, 0)

  return Object.entries(dictionary)
    .reduce((s, [key, { bar, exec_time: execTime }]) => {
      return s + key + printSpaces(maxKeyLn - key.length) + bar + 'ts: ' + execTime + 'ms\n'
    }, '') + '\n Total execution time: ' + metrics.exec_time + 'ms\n'
}

function chartMiddleware (options = {}) {
  return (req, res, next) => {
    const originalSend = res.send
    res.send = function () {
      res.locals.__metrics && console.log(printChart(res.locals.__metrics, options.barWidth))
      return originalSend.apply(res, arguments)
    }
    next()
  }
}

module.exports = {
  printChart,
  chartMiddleware
}
