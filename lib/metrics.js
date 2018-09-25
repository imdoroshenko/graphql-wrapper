function place(path, stack) {
  if (!path) {
    return stack
  }
  const root = path.prev ? place(path.prev, stack) : stack

  if (typeof path.key === 'number') {
    return root
  }

  const resolve = root.find(item => item.key === path.key)

  if (resolve) {
    return resolve.next || (resolve.next = [])
  }
  const obj = {
    key: path.key,
    next: []
  }
  root.push(obj)
  return obj.next
}

async function metricsMiddleware(next, args) {
  const context = args[2]
  const info = args[3]
  const start_ts = Date.now()
  let path = info.path.key
  for(let current = info.path.prev; current; current = current.prev) {
    path = `${current.key}.${path}`
  }

  if (!context.__metrics) {
    context.__metrics = {
      stack: [],
      start_ts: 0,
      end_ts: 0,
      exec_time: 0
    }
  }
  return Promise
    .resolve(next(args))
    .then(result => {
      const stack = place(info.path.prev, context.__metrics.stack)
      const end_ts = Date.now()
      stack.push({
        key: info.path.key,
        path,
        start_ts,
        end_ts,
        exec_time: end_ts - start_ts
      })
      if (!context.__metrics.start_ts) {
        context.__metrics.start_ts = start_ts
      }
      if (end_ts > context.__metrics.end_ts) {
        context.__metrics.end_ts = end_ts
        context.__metrics.exec_time = end_ts - context.__metrics.start_ts
      }
      return result
    })
}

module.exports = { metricsMiddleware }
