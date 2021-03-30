const {decodeShapeHash} = require('./protobuf-support');

function toJsonExample(hash) {
  const decoded = decodeShapeHash(hash)
  return toJson(decoded)
}

const types = {
  OBJECT: 0,
  ARRAY: 1,
  STRING: 2,
  NUMBER: 3,
  BOOLEAN: 4,
  NULL: 5,
}

function toJson(item) {
  switch (item.type) {
    case types.OBJECT:
      const newObj = {}
      item.fields.forEach(({key, hash}) => {
        newObj[key] = toJson(hash)
      })
      return newObj
    case types.ARRAY:
      return [...item.items.map(toJson)]
    case types.STRING:
      return 'string'
    case types.NUMBER:
      return 1
    case types.BOOLEAN:
      return true
    case types.NULL:
      return null
  }
}



module.exports = {
  toJsonExample
}
