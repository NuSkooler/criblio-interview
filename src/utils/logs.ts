import { getConfig } from '../configs/init';
import { Dirent } from 'fs';
import fs from 'fs/promises';
import path from 'path';

/**
 * List entries in a directory recursively.
 *
 * @param base Base directory to enumerate from.
 * @returns `Dirent` entries for each accessible file found.
 */
export const listEntries = async (base?: string): Promise<Array<Dirent>> => {
  base = base || getConfig().app.logLocation;

  const files = [];
  const allEntries = await fs.readdir(base, {
    encoding: 'utf8',
    withFileTypes: true,
  });

  for (const ent of allEntries) {
    if (ent.isDirectory()) {
      try {
        files.push(...(await listEntries(path.join(base, ent.name))));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        if (e.code !== 'EACCES') {
          throw new Error(e);
        }
      }
    } else if (ent.isFile()) {
      files.push(ent);
    }
  }

  return files;
};

export const DefaultMaxLines: number = 1024 * 8; //  let's assume for now, 8k lines is plenty

const MaxChunkSize = 1024 * 16; // up to 16k reads
const LineFeed = 0x0a;

/**
 * Reads up to the last `count` lines from a file.
 *
 * @param filename File in which to process
 * @param count Max number of lines to return
 * @param filter Only return lines containing this string
 * @param encoding Encoding of `filename`; Defaults to utf-8
 * @returns Extracted lines from file
 */
export const readLines = async (
  filename: string,
  count: number = DefaultMaxLines,
  filter: string = undefined,
  encoding: BufferEncoding = 'utf-8'
): Promise<Array<string>> => {
  const fullPath = path.join(getConfig().app.logLocation, filename);

  //
  //  Some scenarios:
  //  |some string|\nanother line here\nfinal line\n| <-- includes final term
  //  |another thing\r\n|but with no\n|final| term!| <-- no terminator, mixed CRLFs!
  //
  //  Read the file backwards, chunk-by-chunk, scanning for \n; Maintain
  //  a tail buffer across chunks for partials. Tidy up strings trimming all
  //  CR/LFs as we add them. When we we run out of bytes or reach our count
  //  return the array.
  //

  const lines: Array<string> = [];
  const fd = await fs.open(fullPath, 'r');

  const stats = await fd.stat();
  let remaining = stats.size;
  let tailBuffer = '';

  const addLine = (s: string): boolean => {
    s = s.replace(/[\r\n]/g, ''); // tidy extra CR/LFs

    if (s.length > 0 && (!filter || s.includes(filter))) {
      lines.push(s);
    }
    return lines.length !== count;
  };

  while (lines.length < count && remaining > 0) {
    const chunkSize = Math.min(MaxChunkSize, remaining);
    const chunkOffset = remaining - chunkSize;
    const readBuf = Buffer.allocUnsafe(chunkSize);
    const readRes = await fd.read(readBuf, 0, chunkSize, chunkOffset);

    if (readRes.bytesRead !== readBuf.length) {
      throw new Error('Failed to read chunk');
    }

    let currLfPosition = readBuf.lastIndexOf(LineFeed);
    let prevLfPosition = readBuf.length;

    while (currLfPosition > -1) {
      const line =
        readBuf
          .subarray(
            currLfPosition + 1,
            prevLfPosition > currLfPosition ? prevLfPosition : readBuf.length
          )
          .toString(encoding) + tailBuffer;

      if (!addLine(line)) {
        break;
      }

      tailBuffer = '';
      prevLfPosition = currLfPosition;

      if (currLfPosition === 0) {
        break; // we can't scan back further
      }

      currLfPosition = readBuf.lastIndexOf(LineFeed, currLfPosition - 1);
    }

    if (prevLfPosition > 0) {
      tailBuffer = readBuf.subarray(0, prevLfPosition).toString(encoding) + tailBuffer;
    }

    remaining -= chunkSize;
  }

  if (tailBuffer) {
    addLine(tailBuffer); // start of file
  }

  fd.close();

  return lines;
};
