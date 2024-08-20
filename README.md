# bit-stream
Write to and read from a stream bit-by-bit in a segmented, consistent, and ordered manner.

## Installation

```sh
npm install @deflexable/bit-stream --save
```

or using yarn

```sh
yarn add @deflexable/bit-stream
```

## Usage

exported `WritableBit` and `ReadableBit` both extends the [Transform Stream](https://nodejs.org/api/stream.html#class-streamtransform)

```js
import { ReadableBit, WritableBit } from '@deflexable/bit-stream';

// write a bit buffer to a stream

const streamer = new WritableBit(); // this class transforms all written to a bit buffer

streamer.pipe(createWriteStream('./output.bin'));

streamer.write(Buffer.from('1', 'utf8'));

streamer.write(Buffer.from('2', 'utf8'));

streamer.write(Buffer.from('3', 'utf8'));

streamer.end(Buffer.from('ending', 'utf8'));

// read a bit buffer from a stream

const reader = new ReadableBit();

reader.on('data', data => {
    /**
     * this handler will always fire multiple times in an order manner
     * 
     *  first event  -> 1
     *  second event -> 2
     *  third event  -> 3
     *  last event   -> ending
     */
    console.log('data: ', Buffer.from(data).toString('utf8'));
});

createReadStream('./output.bin').pipe(reader);

```

## Algorithms

in order to stream the data back in the same order they were written, each written data are transformed into three boundaries which `metadata_size`, `metadata`, and `data`.

- `metadata_size`: this consumes one byte and it contains the bytes size of the `metadata` as an unsigned big-endian number.
- `metadata`: this dynamically consumes around 1 - 8 bytes that stores the bytes size of written data as an unsigned big-endian number.
- `data`: the data that was written

## License

MIT

---