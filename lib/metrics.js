function getFromStack (arrPath, stack) {
  let targetStack = stack
  let targetResolver = null

  for (let i = 0, ln = arrPath.length; i < ln; i++) {
    const key = arrPath[i]
    const nextKey = arrPath[i + 1]
    if (Number.isInteger(key)) {
      if (targetStack[key]) {
        targetResolver = targetStack[key]
      } else {
        targetStack[key] = createResolverMetrics(nextKey)
        targetResolver = targetStack[key]
      }
      targetStack = targetResolver.next
      i++ // jump next one
    } else {
      targetResolver = targetStack.find(item => item.key === key)
      if (!targetResolver) {
        targetResolver = createResolverMetrics(key)
        targetStack.push(targetResolver)
      }
      targetStack = targetResolver.next
    }
  }
  return targetResolver
}

function createResolverMetrics (key) {
  return {
    name: '',
    key,
    path: '',
    relPath: '',
    operation: '',
    args: null,
    start_ts: 0,
    end_ts: 0,
    exec_time: 0,
    next: []
  }
}

function getPathArray (path, operation) {
  let pathArr = [path.key]
  for (let current = path.prev; current; current = current.prev) {
    pathArr.push(current.key)
  }
  return pathArr.reverse()
}

function reduceRelPath (acc, key) {
  return Number.isInteger(key) ? acc : acc + '.' + key
}

async function metricsMiddleware (next, args, { field }) {
  const context = args[2]
  const info = args[3]
  const originArgs = args[1]
  const startTs = Date.now()
  if (!context.__metrics) {
    context.__metrics = {
      stack: [],
      start_ts: startTs,
      end_ts: 0,
      exec_time: 0
    }
  }
  return Promise
    .resolve(next(args))
    .then(result => {
      const pathArr = getPathArray(info.path, info.operation.operation)
      const resolveMetrics = getFromStack(pathArr, context.__metrics.stack)
      const endTs = Date.now()
      resolveMetrics.name = field
      resolveMetrics.path = pathArr.join('.')
      resolveMetrics.args = originArgs
      resolveMetrics.operation = info.operation.operation
      resolveMetrics.relPath = pathArr.reduce(reduceRelPath)
      resolveMetrics.start_ts = startTs
      resolveMetrics.end_ts = endTs
      resolveMetrics.exec_time = endTs - startTs
      if (!context.__metrics.start_ts) {
        context.__metrics.startTs = startTs
      }
      if (endTs > context.__metrics.end_ts) {
        context.__metrics.end_ts = endTs
        context.__metrics.exec_time = endTs - context.__metrics.start_ts
      }
      return result
    })
}

module.exports = { metricsMiddleware }
