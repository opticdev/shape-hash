const {encodeShapeDescriptor, decodeShapeDescriptor} = require('./wire')

const encodeShapeHash =  payload => {
  const message = encodeShapeDescriptor(payload);
  return message
};

const decodeShapeHash =  (hash) => {
  return decodeShapeDescriptor(Buffer.from(hash, "hex"));
}

module.exports = {
  encodeShapeHash,
  decodeShapeHash
};
