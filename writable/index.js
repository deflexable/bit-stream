const { Transform } = require('stream');
const { segmentBinary } = require('segment-binary');

class WritableBit extends Transform {
    constructor(opts) {
        super(opts);
    }

    _transform(chunk, encoding, callback) {
        try {
            const buf = segmentBinary(Buffer.from(chunk, encoding));
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

module.exports = {
    WritableBit
};