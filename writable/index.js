const { Transform } = require('stream');

class WritableBit extends Transform {
    constructor(opts) {
        super(opts);
    }

    _transform(chunk, encoding, callback) {
        try {
            const buf = segmentBuffer(Buffer.from(chunk, encoding));
            callback(null, buf);
        } catch (error) {
            callback(error || new Error(`${error}`));
        }
    }
    // a work around for now
    // _transform is not always called before the stream ends
    _flush(callback) {
        setTimeout(() => {
            callback();
        }, 0);
    }
}

const segmentBuffer = (buf) => {
    const neededBytes = calculateBytesNeeded(buf.length);
    const offsetDataBuffer = Buffer.alloc(neededBytes);
    offsetDataBuffer.writeUIntBE(buf.length, 0, neededBytes);

    const neededBytesBuf = Buffer.alloc(1);
    neededBytesBuf.writeUIntBE(neededBytes, 0, 1);

    return Buffer.concat([neededBytesBuf, offsetDataBuffer, buf]);
};

const BYTES_TO_SIZE_MAP = [
    [1, 2 ** 8],
    [2, 2 ** 16],
    [3, 2 ** 24],
    [4, 2 ** 32],
    [5, 2 ** 40],
    [6, 2 ** 48],
    [7, 2 ** 56],
    [8, 2 ** 64]
];

// Function to calculate the minimum number of bytes needed to store a length
function calculateBytesNeeded(length) {
    const requiredBytes = BYTES_TO_SIZE_MAP.find(([_, v]) => length < v)?.[0];
    if (requiredBytes) return requiredBytes;
    throw new Error('allocatable byte exceeded for byte:' + length);
}

module.exports = {
    WritableBit
};