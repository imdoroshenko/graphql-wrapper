function printBar(x0, x1, length) {
  let s = '['
  for(let i = 0; i < length; i++) {
    const r = i / length
    s += r >= x0 && r <= x1 ? '-' : ' '
  }
  return s + ']'
}

function printSpaces(ln) {
  let s = ''
  while(ln--) {
    s += ' '
  }
  return s
}

function printChart(metrics) {
  const
    x0 = metrics.start_ts,
    d = metrics.exec_time,
    dictionary = Object.create(null)

  ;(function recursive(stack, parent = 0) {
    stack
      .sort(({start_ts: a}, {start_ts: b}) => a - b)
      .forEach((item, i, {length}) => {
        const last = i === length - 1
        const key = (parent ? printSpaces(parent) + (last ? '\u2514' : '\u251C') : '') + item.path
        dictionary[key] = {
          end_ts: item.end_ts,
          start_ts: item.start_ts,
          exec_time: item.exec_time,
          bar: printBar((item.start_ts - x0) / d, (item.end_ts - x0) / d, 150)
        }
        item.next && recursive(item.next, parent + 1)
      })
  })(metrics.stack)

  const maxKeyLn = Object.keys(dictionary).reduce((ln, key) => key.length > ln ? key.length : ln, 0)

  return Object.entries(dictionary)
    .reduce((s, [key, {bar, exec_time}]) => {
      return s + key + printSpaces(maxKeyLn - key.length) + bar + 'ts: ' + exec_time +  'ms\n'
    }, '') + '\n Total execution time: ' + metrics.exec_time + 'ms\n'
}

module.exports = {
  printChart
}
