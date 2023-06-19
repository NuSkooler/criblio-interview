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

  const stats = await fs.stat(fullPath);

  if (stats.size === 0) {
    return [];
  }

  //
  //  Read from EoF to start of file, chunk by chunk.
  //  Keep a buffer of the current line for cross-buffer boundaries.
  //  Capture:
  //  * EoL -> EoL
  //  * start of file -> EoL
  //  * EoL -> end (non-terminated)
  //
  const chunkSize = Math.min(MaxChunkSize, stats.size);
  const lines: Array<string> = [];
  let remaining = stats.size;
  let fileOffset = remaining;
  let lineBuffer = '';
  let endLineOffset: number;
  const fd = await fs.open(fullPath, 'r');

  const filterMatch = (s: string): boolean => {
    return filter === undefined || s.includes(filter);
  };

  const addLine = (buf: Buffer, start: number, end?: number): void => {
    const s = buf.subarray(start, end).toString(encoding).trim() + lineBuffer;
    if (s.length > 0 && filterMatch(s)) {
      lines.push(s);
    }
    lineBuffer = '';
  };

  const readBuf = Buffer.allocUnsafe(chunkSize);
  fileOffset -= Math.min(chunkSize, remaining);

  while (lines.length < count) {
    const readRes = await fd.read(readBuf, 0, chunkSize, fileOffset);

    if (readRes.bytesRead < 1) {
      break;
    }

    //  If we've buffered, we have the tail, but need the
    //  start of the line. Try to finish it up in the current chunk.
    if (lineBuffer.length > 0) {
      const startLineOffset = readRes.buffer.lastIndexOf(LineFeed);
      if (startLineOffset < 0) {
        //  we need to read more
        remaining -= readRes.bytesRead;
        fileOffset -= Math.min(chunkSize, remaining);

        if (remaining < 0) {
          //  remainder of file from start
          addLine(readRes.buffer, 0);
          break;
        } else {
          continue;
        }
      }

      addLine(readRes.buffer, startLineOffset);
      endLineOffset = startLineOffset;
    } else {
      endLineOffset = readRes.buffer.lastIndexOf(LineFeed);
    }

    if (endLineOffset > -1) {
      if (remaining === stats.size && endLineOffset < readRes.buffer.length - 1) {
        // first pass: take end LF -> EoF, if any
        addLine(readRes.buffer, endLineOffset);
      }

      const remainder = readRes.buffer.subarray(0, endLineOffset);
      let startLineOffset = remainder.lastIndexOf(LineFeed);
      if (startLineOffset < 0) {
        // no more to read; reserve buffer
        lineBuffer = remainder.toString(encoding).trim();
      } else {
        while (lines.length < count && startLineOffset < endLineOffset) {
          addLine(remainder, startLineOffset, endLineOffset);

          endLineOffset = startLineOffset;
          startLineOffset = remainder.lastIndexOf(LineFeed, startLineOffset - 1);

          if (startLineOffset < 0) {
            // no more to read; reserve buffer & break loop
            lineBuffer = remainder.subarray(0, endLineOffset).toString(encoding);
            break;
          }
        }
      }
    }

    remaining -= readRes.bytesRead;
    fileOffset -= Math.min(chunkSize, remaining);

    if (remaining <= 0) {
      //  remainder to start of file?
      if (lineBuffer.length > 0) {
        const line = lineBuffer.trim();
        if (filterMatch(line)) {
          lines.push(line);
        }
      }
      break;
    }
  }

  fd.close();

  return lines;
};
