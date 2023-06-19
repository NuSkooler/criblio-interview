import { listEntries, readLines } from '../src/utils/logs';
import { setConfig } from '../src/configs/init';
import { Mode } from '../src/configs/app';
import path from 'path';
import fs from 'fs';
import { tmpdir } from 'os';

enum TestFiles {
  SimpleLf = 'simple.lf.log',
  SimpleLfNoTerm = 'simple.lf.no-term.log',
  SimpleCrLf = 'simple.crlf.log',
  //SimpleCrLfNoTerm
  // SimpleMixed,
  // SingleLine,
  // EmptyFile,
}

let tempDir: string;

beforeAll(() => {
  tempDir = fs.mkdtempSync(path.join(tmpdir(), 'cribl.io'));

  setConfig({
    app: { mode: Mode.LEADER, logLocation: tempDir },
  });

  const mkData = (f: string, d: string): void => {
    fs.writeFileSync(path.join(tempDir, f), d, { encoding: 'utf-8' });
  };

  mkData(TestFiles.SimpleLf, `This is a\nsimple Unix style\nlog\nfile\n`);

  mkData(TestFiles.SimpleLfNoTerm, `Another\nsimple\nUnix stye log\nbut not terminated`);

  mkData(TestFiles.SimpleCrLf, `A simple\r\nWindows style\r\nlog with CRLFs\r\n`);
});

afterAll(() => {
  if (tempDir) {
    fs.rmdirSync(tempDir, { recursive: true });
  }
});

describe('should list all files', () => {
  test('list test data files', async () => {
    const list = await listEntries();
    expect(list).toHaveLength(Object.keys(TestFiles).length);
  });
});

describe('should read lines from files', () => {
  test('simple unix style line feeds', async () => {
    const lines = await readLines(TestFiles.SimpleLf);
    expect(lines).toHaveLength(4);
    expect(lines).toEqual(['file', 'log', 'simple Unix style', 'This is a']);
  });

  test('simple unix style line feeds, no terminator', async () => {
    const lines = await readLines(TestFiles.SimpleLfNoTerm);
    expect(lines).toHaveLength(4);
    expect(lines).toEqual(['but not terminated', 'Unix stye log', 'simple', 'Another']);
  });

  test('simple windows style line feeds', async () => {
    const lines = await readLines(TestFiles.SimpleCrLf);
    expect(lines).toHaveLength(3);
    expect(lines).toEqual(['log with CRLFs', 'Windows style', 'A simple']);
  });
});
