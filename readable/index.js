
const { Transform } = require('stream');

class ReadableBit extends Transform {
    constructor(opts) {
        super(opts);
        this.leftOvers = undefined;
    }

    _transform(chunk, _, callback) {
        try {
            this.leftOvers = this.leftOvers ? Buffer.concat([this.leftOvers, chunk]) : chunk;
            let buf;

            const stream_bit = desegmentBuffer(this.leftOvers);
            if (stream_bit) {
                const [bits, remainder] = stream_bit;
                this.leftOvers = remainder;
                buf = bits;
            }
            if (buf) {
                buf.forEach(e => {
                    this.push(e);
                });
            }
            callback(null);
        } catch (error) {
            callback(error || new Error(`${error}`));
        }
    }
}

/**
 * @type {( buf: Buffer ) => null | [Buffer, Buffer]}
 */
const desegmentBuffer = (buf) => {
    let offset = 0, thisSegment;
    const blocks = [];

    while ((thisSegment = readVariableLength(buf, offset)) !== null) {
        const { byteSize, byteOffset } = thisSegment;
        const binary = buf.subarray(offset = byteOffset, offset += byteSize);
        blocks.push(binary);
    }

    if (!blocks.length) return null;
    return [blocks, buf.subarray(offset, buf.length)];
}

function readVariableLength(buffer, offset) {
    if (buffer.length - offset === 0) return null;
    const unsignIntSize = buffer.readUIntBE(offset, 1);

    if (++offset + unsignIntSize > buffer.length) return null;

    const byteSize = buffer.readUIntBE(offset, unsignIntSize);

    if (offset + unsignIntSize + byteSize > buffer.length) return null;

    return {
        byteOffset: offset + unsignIntSize,
        byteSize
    };
}

module.exports = {
    ReadableBit
};