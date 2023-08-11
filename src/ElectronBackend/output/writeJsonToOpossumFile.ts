// SPDX-FileCopyrightText: Meta Platforms, Inc. and its affiliates
// SPDX-FileCopyrightText: TNG Technology Consulting GmbH <https://www.tngtech.com>
//
// SPDX-License-Identifier: Apache-2.0

import * as fflate from 'fflate';
import JSZip from 'jszip';
import fs from 'fs';
import log from 'electron-log';
import { OPOSSUM_FILE_COMPRESSION_LEVEL } from '../shared-constants';
import { Unzipped } from 'fflate';

export function writeOpossumFile(
  opossumfilePath: string,
  inputfileData: unknown,
  outputfileData: unknown | null,
): void {
  const writeStream = fs.createWriteStream(opossumfilePath);

  const dataToZip: fflate.Zippable = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    'input.json': fflate.strToU8(inputfileData as any),
  };
  if (outputfileData) {
    dataToZip['output.json'] = fflate.strToU8(JSON.stringify(outputfileData));
  }
  const archive = fflate.zipSync(dataToZip, {
    level: OPOSSUM_FILE_COMPRESSION_LEVEL,
  });

  writeStream.write(archive);
}

export async function writeOutputJsonToOpossumFile(
  opossumfilePath: string,
  outputfileData: unknown,
): Promise<void> {
  const new_zip = new JSZip();

  await new Promise<void>((resolve) => {
    fs.readFile(opossumfilePath, (err, data) => {
      if (err) throw err;
      new_zip.loadAsync(data).then(() => {
        new_zip.file('output.json', JSON.stringify(outputfileData));
        const writeStream = fs.createWriteStream(opossumfilePath);
        new_zip
          .generateNodeStream({
            type: 'nodebuffer',
            streamFiles: true,
            compression: 'DEFLATE',
            compressionOptions: { level: OPOSSUM_FILE_COMPRESSION_LEVEL },
          })
          .pipe(writeStream)
          .on('finish', () => {
            log.info('opossum file was overwritten!');
            resolve();
          });
      });
    });
  });
}

export async function writeOutputJsonToOpossumFileWithFflate(
  opossumfilePath: string,
  outputfileData: unknown,
): Promise<void> {
  const originalZipBuffer: Buffer = await new Promise((resolve) => {
    fs.readFile(opossumfilePath, (err, data) => {
      if (err) throw err;
      resolve(data);
    });
  });

  const unzipResult: Unzipped = await new Promise((resolve) => {
    fflate.unzip(new Uint8Array(originalZipBuffer), (err, data) => {
      if (err) throw err;
      resolve(data);
    });
  });

  unzipResult['output.json'] = fflate.strToU8(JSON.stringify(outputfileData));

  const zippedData: Uint8Array = await new Promise((resolve) => {
    fflate.zip(unzipResult, (err, data) => {
      if (err) throw err;
      resolve(data);
    });
  });

  fs.writeFileSync(opossumfilePath, Buffer.from(zippedData));
}
