# Shape Hash
> A PID-free, lightweight format, for saving and analyzing the behavior of APIs at scale.

## Usage
```bash
npm install shape-hash --save
```

```javascript
const {toHash} = require('shape-hash')
const hash1 = toHash({firstName: 'Aidan', os: 'mac'})
const hash2 = toHash({firstName: 'Lisa', os: 'linux'})
const hash3 = toHash({firstName: 'Dev', os: ['mac', 'linux']})

console.log(hash1)
console.log(hash2)
console.log(hash3)
```

[**Live Demo**](https://repl.it/@acunniffe/Shape-Hash-Demo)

## Specification

### Abstract
The Shape Hasher produces the same hash for two similar JSON-like objects. The Shape Hash answers abstract questions about the shape of the data, but strips out the data making it safe to share with logging tools and persist for later analysis.

```json
{
  "firstname": "Aidan",
  "homestate": "PA"
}
```
```json
{
  "firstname": "Dev",
  "homestate": "New Jersey"
}
```
Produce the same hash: `a163f39e56668850646b63d7d32a4e64a0ffd469`

As they are not intended to be written manually by developers, Shape Hashes have a far simpler specification than JSON Schema. This makes them faster to generate from real data, compare to other shape hashes, and implement with identical behavior in any language.

#### Use Cases at Optic and Beyond
- Chaos engineering / anomaly detection. Have the APIs I depend on changed their behavior? You see 1M requests a day with a distinct set of 12 Shape Hashes being used. Now you see 4 new Hashes and no traffic to two others you know our code works well with. Something changed, better look!
- Analyzing API Behavior at Scale. JSON Schema and other schema languages require parallel traversal of the schema and data. Doing that 1M times requires you to store a huge amount of traffic (megabytes/gigabytes) and takes many minutes to compute. Alternatively, computing a shape hash from data is a single fast traversal of the data and then comparing it to known hashes is just string comparison. [Insert big data problem regarding APIs here]
- Quickly documenting hundreds of APIs from traffic (what Optic does) without having to store/share any sensitive data

### The Shape Hash Data Structure
A Shape Hash is encoded as a Protocol Buffer message. There are only two message types:
- **FieldDesciptor** -- a named field, typically used in an object or map
- **ShapeDescriptor** -- a description of a shape. Includes type (enum), fields (array) and items (array). The root of any Shape Hash must always be a ShapeDesriptor

```proto3
syntax = "proto3";
package optic_shape_hash;

message Field {
  string key = 1;
  ShapeHash hash = 2;
}

message ShapeDescriptor {
  enum PrimitiveType {
    OBJECT = 0;
    ARRAY = 1;
    STRING = 2;
    NUMBER = 3;
    BOOLEAN = 4;
    NULL = 5;
  }
  PrimitiveType type = 1;
  repeated Field fields = 2;
  repeated ShapeHash items = 3;
}
```

This structure allows you to encode basic information about a Shape. It intentionally does not try to handle any kind of polymorphism like optionals or one-ofs. That information can only be inferred by looking at Shape Hashes in the aggregate and should not be a concern of the hasher itself which should be stateless.


#### Building the Shape Hash
Building a Shape Hash is as easy as traversing a JSON-like structure recursively and outputting a ShapeDescriptor Tree.

The input:
```json
{
  "firstname": "Aidan",
  "homestate": "PA"
}
```
Is represented by:
```json
 {
    "type": 0,
    "fields": [
        {
            "key": "firstname",
            "hash": {
                "type": 2,
                "fields": [],
                "items": []
            }
        },
        {
            "key": "homestate",
            "hash": {
                "type": 2,
                "fields": [],
                "items": []
            }
        }
    ],
    "items": []
}
```

There's a full reference implementation used in production by Optic in the repo here:

##### Encoding
- All shapes hashes should be serialized to byte arrays using Protocol Buffers (above example becomes) `0800120f0a0966697273746e616d6512020802120f0a09686f6d65737461746512020802`
- These hashes are decodable using the original proto into the structure above. That's helpful for tools like Optic that want to be able to diff a Shape against an expected Shape or Schema
- If you don't care about being able to decode and strickly want to compare the shapes to one another, we suggest putting the serialized bytes through a SHA-256 hasher to reduce the size of the message and further obscure data.


