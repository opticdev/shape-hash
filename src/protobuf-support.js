const protobuf = require("protobufjs");
const path = require('path')

const ShapeHashProto = (() => {
  const root = protobuf.loadSync(path.resolve(__dirname, 'shapehash.proto'));
  return root.lookupType("optic_shape_hash.ShapeDescriptor");
})();

const encodeShapeHash = payload => {
  const message = ShapeHashProto.create(payload);
  return ShapeHashProto.encode(message).finish();
};

const decodeShapeHash = (hash) => {
  try {
    const decodedMessage = ShapeHashProto.decode(Buffer.from(hash, "hex"));
    return decodedMessage
  } catch (e) {
    if (e instanceof protobuf.util.ProtocolError) {
      // e.instance holds the so far decoded message with missing required fields
    } else {
      // wire format is invalid
    }
  }
}


module.exports = {
  encodeShapeHash,
  decodeShapeHash
};
