const { Transform } = require('stream');
const { desegmentBinary } = require('segment-binary');

class ReadableBit extends Transform {
    constructor(opts) {
        super(opts);
        this.leftOvers = undefined;
    }

    _transform(chunk, _, callback) {
        try {
            this.leftOvers = this.leftOvers ? Buffer.concat([this.leftOvers, chunk]) : chunk;
            let buf;

            const stream_bit = desegmentBinary(this.leftOvers);
            if (stream_bit) {
                const { blocks, remainder } = stream_bit;
                this.leftOvers = remainder;
                buf = blocks;
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

    // a work around for now
    // _transform is not always called before the stream ends
    _flush(callback) {
        setTimeout(() => {
            callback();
        }, 0);
    }
}

module.exports = {
    ReadableBit
};