const {isObjectType, isInputObjectType} = require('graphql')

function wrapper(schema, rules) {
  wrapSchema(schema, {
    rules: mapRules(rules)
  })
  return schema
}

function wrapSchema(schema, {rules}) {
  const types = schema.getTypeMap()
  for (let name in types) {
    wrapType(types[name], {rules})
  }
}

function wrapType(type, {rules}) {
  if (!(isObjectType(type) || isInputObjectType(type))) {
    return
  }
  const fieldsRules = getFieldsRulesForType(type, rules)
  if (fieldsRules.length === 0) {
    return
  }

  const fields = type.getFields()
  for (let name in fields) {
    wrapField(fields[name], {
      rules: fieldsRules,
      type
    })
  }
}

function wrapField(field, {type, rules}) {
  const fieldRules = getFieldRules(field, rules)
  if (fieldRules.length > 0) {
    fieldRules
      .reverse()
      .forEach(({handlers}) => handlers.forEach(handler => wrapFieldResolve({field, type}, handler)))
  }
}

function wrapFieldResolve({field, type}, handler) {
  if (!field.__originalResolve) {
    field.__originalResolve = field.resolve
  }

  const resolve = field.resolve || noopResolve
  field.resolve = function() {
    const args = arguments
    return handler(
      handledArgs => resolve.apply(null, (handledArgs || args)),
      args,
      {
        field: field.name,
        type: type.name
      }
    )
  }
  return field
}

function getFieldRules({name, resolve}, rules) {
  return rules.filter(rule => ((resolve || rule.force) && rule.field === '*') || rule.field === name)
}

function getFieldsRulesForType({name}, rulesMap) {
  return rulesMap.filter(rule => rule.type === '*' || rule.type === name)
}

function mapRules(rules) {
  return rules.map(([path, ...handlers]) => {
    const
      force = path.indexOf('!') === 0,
      [type, field] = path.replace(/^!/, '').split('.')
    return {type, field, handlers: handlers.filter(handler => handler), force}
  })
}

function noopResolve(obj, args, context, {fieldName}) {
  return obj ? obj[fieldName] : undefined
}

module.exports = { wrapper }
