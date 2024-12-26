import {
  DocumentFlatTreeItem,
  DocumentFlatTreeMetadata,
} from '@/interface/document.interface';

export function joinDocumentPath(...paths: (string | undefined | null)[]) {
  return paths.filter(Boolean).join('/');
}

export function documentItemsSorter(
  items: DocumentFlatTreeItem[],
  metadata: DocumentFlatTreeMetadata,
) {
  return items.sort((a, z) => {
    let value =
      metadata[a.id].name.localeCompare(metadata[z.id].name ?? '', undefined, {
        numeric: true,
        sensitivity: 'base',
      }) ?? 0;
    if (z.isDir && !a.isDir) value = 2;
    else if (a.isDir && !z.isDir) value = -2;

    return value;
  });
}

export function getDocumentParentDir(
  path: string,
  name?: string,
): { parentDir: string; filename: string } {
  if (!name) {
    const lastSepIndex = path.lastIndexOf('/');
    return lastSepIndex === -1
      ? { parentDir: '', filename: path }
      : {
          parentDir: path.slice(0, lastSepIndex),
          filename: path.slice(lastSepIndex + 1),
        };
  }

  return {
    filename: name,
    parentDir: path.slice(0, -name.length - 1),
  };
}

export function getNameFromPath(path: string) {
  return path.slice(path.lastIndexOf('/') + 1);
}

const illegalRe = /[/?<>\\:*|":]/g;
// eslint-disable-next-line no-control-regex
const controlRe = /[\x00-\x1f\x80-\x9f]/g;
// https://github.com/parshap/node-sanitize-filename/blob/master/index.js
export function sanitizeDocumentFileName(input: string) {
  const sanitized = input.replace(illegalRe, '').replace(controlRe, '');

  const uint8Array = new TextEncoder().encode(sanitized);
  const truncated = uint8Array.slice(0, 255);

  return new TextDecoder().decode(truncated);
}

export function getRootPaths(paths: string[]) {
  if (paths.length <= 1) return paths;

  const splittedPaths = paths.map((path) => path.split('/'));
  paths.sort(
    (a, z) =>
      splittedPaths[paths.indexOf(a)].length -
      splittedPaths[paths.indexOf(z)].length,
  );

  const rootItems: string[] = [];
  for (const path of paths) {
    const isRoot = !rootItems.some((root) => path.startsWith(root));
    if (isRoot) rootItems.push(path);
  }

  return rootItems;
}
