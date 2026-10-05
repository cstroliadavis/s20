import { createCsvParser, parseCsvStream } from './parser.js';
import { createCsvStringifier } from './stringifier.js';
import type {
  CsvParserOptions,
  CsvReader,
  CsvRecord,
  CsvRow,
  CsvStringifierOptions,
  CsvValue,
  CsvWriter,
} from './types.js';

interface WriterState {
  fileWriter: ReturnType<ReturnType<typeof Bun.file>['writer']> | null;
  isClosed: boolean;
  streamWriter: WritableStreamDefaultWriter<string> | null;
  stringifier: ReturnType<typeof createCsvStringifier>;
}

/**
 * Closes the active writer sink and flushes pending data.
 */
async function closeWriter(state: WriterState): Promise<void> {
  if (state.isClosed) return;

  state.isClosed = true;

  await endSink(state);
}

/**
 * Initializes the writer state object.
 */
function createWriterState(
  destination: string | WritableStream<Uint8Array | string>,
  options: CsvStringifierOptions,
): WriterState {
  const isFilePath = typeof destination === 'string';

  return {
    fileWriter: isFilePath ? Bun.file(destination).writer() : null,
    isClosed: false,
    streamWriter: !isFilePath ? (destination as WritableStream<string>).getWriter() : null,
    stringifier: createCsvStringifier(options),
  };
}

/**
 * Closes the active underlying sink (file or stream).
 */
async function endSink(state: WriterState): Promise<void> {
  if (state.fileWriter !== null) {
    await state.fileWriter.end();

    return;
  }

  if (state.streamWriter !== null) {
    await state.streamWriter.close();
  }
}

/**
 * Enqueues an array of parsed rows or records to a transform stream controller.
 */
function enqueueRows<T>(
  rows: (CsvRow | CsvRecord)[],
  controller: TransformStreamDefaultController<T>,
): void {
  for (const row of rows) {
    controller.enqueue(row as T);
  }
}

/**
 * Flushes buffered decoder text and flushes the parser on stream end.
 */
function flushTransformer<T>(
  decoder: TextDecoder,
  parser: ReturnType<typeof createCsvParser>,
  controller: TransformStreamDefaultController<T>,
): void {
  const trailing = decoder.decode();

  if (trailing.length > 0) {
    enqueueRows(parser.write(trailing), controller);
  }

  enqueueRows(parser.end(), controller);
}

/**
 * Flushes the underlying writer sink if supported.
 */
async function flushWriter(state: WriterState): Promise<void> {
  if (state.fileWriter !== null) {
    await state.fileWriter.flush();
  }
}

/**
 * Streams formatted CSV string lines from parsed records or rows.
 */
async function* readLines(
  iterate: () => AsyncGenerator<unknown>,
  options: CsvParserOptions,
): AsyncIterable<string> {
  const stringifier = createCsvStringifier({
    delimiter: options.delimiter,
    lineBreak: '\n',
    quote: options.quote,
  });

  for await (const item of iterate()) {
    yield Array.isArray(item)
      ? stringifier.stringifyRow(item as CsvValue[])
      : stringifier.stringifyRecord(item as Record<string, CsvValue>);
  }
}

/**
 * Consumes all elements from an async iterable generator into an array.
 */
async function readToArray<T>(iterate: () => AsyncGenerator<T>): Promise<T[]> {
  const results: T[] = [];

  for await (const item of iterate()) {
    results.push(item);
  }

  return results;
}

/**
 * Writes all items from an iterable into the CSV writer sink.
 */
async function writeAllItems(
  items: Iterable<CsvValue[]> | Iterable<Record<string, CsvValue>>,
  state: WriterState,
): Promise<void> {
  for (const item of items) {
    const text = Array.isArray(item)
      ? state.stringifier.stringifyRow(item)
      : state.stringifier.stringifyRecord(item);

    await writeChunk(text, state);
  }
}

/**
 * Writes text chunks to the active destination sink.
 */
async function writeChunk(text: string, state: WriterState): Promise<void> {
  if (state.fileWriter !== null) {
    state.fileWriter.write(text);

    return;
  }

  if (state.streamWriter !== null) {
    await state.streamWriter.write(text);
  }
}

/**
 * Creates a TransformStream that serializes rows or records into formatted CSV text.
 *
 * @param options - Stringifier options such as delimiter, lineBreak, and headers.
 * @returns A TransformStream that emits formatted CSV text chunks.
 * @example
 * ```ts
 * const formatStream = createCsvFormatTransformStream({ lineBreak: '\n' });
 * // Formats row objects or arrays into CSV string lines
 * ```
 */
export function createCsvFormatTransformStream(
  options: CsvStringifierOptions = {},
): TransformStream<CsvValue[] | Record<string, CsvValue>, string> {
  const stringifier = createCsvStringifier(options);

  return new TransformStream({
    transform(item, controller) {
      const line = Array.isArray(item)
        ? stringifier.stringifyRow(item)
        : stringifier.stringifyRecord(item);

      controller.enqueue(line);
    },
  });
}

/**
 * Creates a streaming CSV reader for iterating through rows or collecting them.
 *
 * @template T - The item type yielded by the reader: `CsvRow` (array) or `CsvRecord` (object).
 * @param source - The underlying ReadableStream or AsyncIterable.
 * @param options - Parser configuration options.
 * @returns A CsvReader object with async iterator and stream capabilities.
 * @example
 * ```ts
 * const reader = createCsvReader(Bun.file('data.csv').stream());
 * for await (const row of reader) {
 *   console.log(row);
 * }
 * ```
 */
export function createCsvReader<T = CsvRow | CsvRecord>(
  source: AsyncIterable<Uint8Array | string> | ReadableStream<Uint8Array | string>,
  options: CsvParserOptions = {},
): CsvReader<T> {
  /**
   * Generates parsed CSV rows or records asynchronously.
   */
  async function* iterate(): AsyncGenerator<T> {
    yield* parseCsvStream<T>(source, options);
  }

  /**
   * Wraps the async row generator into a readable Web stream.
   */
  function stream(): ReadableStream<T> {
    return toReadableStream(iterate());
  }

  return {
    [Symbol.asyncIterator]: iterate,
    lines: () => readLines(iterate, options),
    pipeThrough: <U>(transform: TransformStream<T, U>) => stream().pipeThrough(transform),
    stream,
    toArray: () => readToArray(iterate),
  };
}

/**
 * Creates a TransformStream that transforms chunks into parsed CSV rows or records.
 *
 * @template T - The parsed row type emitted by the transform (`CsvRow` array or `CsvRecord` object).
 * @param options - Parser options such as delimiter, quote, headers, and trim.
 * @returns A TransformStream that emits parsed rows or records.
 * @example
 * ```ts
 * const stream = fileStream.pipeThrough(createCsvTransformStream({ columns: true }));
 * // Stream now yields parsed record objects
 * ```
 */
export function createCsvTransformStream<T = CsvRow | CsvRecord>(
  options: CsvParserOptions = {},
): TransformStream<Uint8Array | string, T> {
  const parser = createCsvParser(options);
  const decoder = new TextDecoder();

  return new TransformStream({
    flush(controller) {
      flushTransformer(decoder, parser, controller);
    },
    transform(chunk, controller) {
      const text = typeof chunk === 'string' ? chunk : decoder.decode(chunk, { stream: true });

      enqueueRows(parser.write(text), controller);
    },
  });
}

/**
 * Creates a streaming CSV writer targeting a file path or WritableStream sink.
 *
 * @param destination - Target file path string or WritableStream.
 * @param options - Stringifier configuration options.
 * @returns A CsvWriter instance.
 * @example
 * ```ts
 * const writer = createCsvWriter('output.csv');
 * await writer.writeRow(['Name', 'Score']);
 * await writer.writeRow(['Alice', 95]);
 * await writer.close();
 * ```
 */
export function createCsvWriter(
  destination: string | WritableStream<Uint8Array | string>,
  options: CsvStringifierOptions = {},
): CsvWriter {
  const _ = createWriterState(destination, options);

  return {
    close: () => closeWriter(_),
    flush: () => flushWriter(_),
    writeAll: (items) => writeAllItems(items, _),
    writeRecord: (record) => writeChunk(_.stringifier.stringifyRecord(record), _),
    writeRow: (row) => writeChunk(_.stringifier.stringifyRow(row), _),
  };
}

/**
 * Converts an async iterable into a Web ReadableStream.
 *
 * @template T - The item type emitted by the readable stream.
 * @param iterable - The async iterable to convert.
 * @returns A ReadableStream yielding items from the iterable.
 * @example
 * ```ts
 * const stream = toReadableStream(generateRows());
 * ```
 */
export function toReadableStream<T>(iterable: AsyncIterable<T>): ReadableStream<T> {
  const ctor = ReadableStream as unknown as {
    from?: <U>(source: AsyncIterable<U>) => ReadableStream<U>;
  };

  if (typeof ctor.from === 'function') return ctor.from(iterable);

  const iterator = iterable[Symbol.asyncIterator]();

  return new ReadableStream<T>({
    async pull(controller) {
      const { done, value } = await iterator.next();

      if (done) {
        controller.close();

        return;
      }

      controller.enqueue(value);
    },
  });
}
