#!/usr/bin/env node

const BASE64_TOKEN = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

function cleanToken(token: string): string {
  return token.replace(/^[\s"'`\[\](){}]+|[\s"'`\[\](){}]+$/g, '');
}

function isValidBase64(token: string): boolean {
  if (token.length === 0 || token.length % 4 !== 0) {
    return false;
  }

  return BASE64_TOKEN.test(token);
}

function decodeAndWrite(token: string): void {
  const cleaned = cleanToken(token);
  if (cleaned.length === 0) {
    return;
  }

  if (!isValidBase64(cleaned)) {
    throw new Error(`Invalid base64 token: ${cleaned}`);
  }

  const decoded = Buffer.from(cleaned, 'base64');
  const bytes = Uint8Array.from(decoded);
  process.stdout.write(Buffer.from(bytes));
}

let pending = '';

function processBuffer(isFinalChunk: boolean): void {
  const parts = pending.split(/[\s,]+/);
  const trailing = parts.pop() ?? '';

  if (!isFinalChunk) {
    pending = trailing;
  } else {
    pending = '';
  }

  for (const token of parts) {
    decodeAndWrite(token);
  }

  if (isFinalChunk && trailing.trim().length > 0) {
    decodeAndWrite(trailing);
  }
}

process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk: string) => {
  pending += chunk;
  processBuffer(false);
});

process.stdin.on('end', () => {
  try {
    processBuffer(true);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  }
});

process.stdin.on('error', (error: Error) => {
  process.stderr.write(`stdin error: ${error.message}\n`);
  process.exitCode = 1;
});
