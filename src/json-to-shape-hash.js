const {encodeShapeHash, decodeShapeHash} = require('./protobuf-support');

function jsonToShapeHash(_data) {
  const jsTypeString = Object.prototype.toString.call(_data);
  if (jsTypeString === '[object Array]') {
    return ShapeHash(
      PrimitiveTypes.ARRAY,
      [],
      _data.map(item => jsonToShapeHash(item)));
  } else if (jsTypeString === '[object Object]') {
    return ShapeHash(
      PrimitiveTypes.OBJECT,
      Object.entries(_data).map(([key, value]) => ({key, hash: jsonToShapeHash(value)})),
      []);
  } else if (jsTypeString === '[object Number]') {
    return ShapeHash(PrimitiveTypes.NUMBER);
  } else if (jsTypeString === '[object String]') {
    return ShapeHash(PrimitiveTypes.STRING);
  } else if (jsTypeString === '[object Null]') {
    return ShapeHash(PrimitiveTypes.NULL);
  } else if (jsTypeString === '[object Boolean]') {
    return ShapeHash(PrimitiveTypes.BOOLEAN);
  } else {
    throw new Error('Unknown type! ' + jsTypeString);
  }
}

function toBytes(json) {
  const hashMessage = jsonToShapeHash(json)
  return Buffer.from(encodeShapeHash(hashMessage))
}

function toHash(json) {
  return bufferToHex(toBytes(json))
}

function bufferToHex(buffer) {
  return Array
    .from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

const PrimitiveTypes = {
  OBJECT: 0,
  ARRAY: 1,
  STRING: 2,
  NUMBER: 3,
  BOOLEAN: 4,
  NULL: 5
};

function ShapeHash(type, fields = [], items = [], rules = []) {
  return {type, fields, items, rules};
}

function toJsonExample(hash) {
  const decoded = decodeShapeHash(hash)
  return toJson(decoded)
}

const types = {
  OBJECT: 'OBJECT',
  ARRAY: 'ARRAY',
  STRING: 'STRING',
  NUMBER: 'NUMBER',
  BOOLEAN: 'BOOLEAN',
  NULL: 'NULL',
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
  jsonToShapeHash,
  toBytes,
  toHash,
  toJsonExample
}
