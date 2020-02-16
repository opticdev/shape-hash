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

module.exports = {
  encodeShapeHash
};
