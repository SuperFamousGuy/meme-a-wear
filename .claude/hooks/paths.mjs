// Path helpers shared by the guard hooks.
import { lstatSync, realpathSync } from "node:fs";
import { basename, dirname, join } from "node:path";

// Resolves symlinks in the longest existing prefix, so a new file in an
// existing directory, or a new directory, still resolves correctly.
export function canonical(path) {
  const tail = [];
  let current = path;
  for (;;) {
    try {
      return join(realpathSync(current), ...tail.reverse());
    } catch {
      // Only a truly missing entry may be skipped. An entry that exists but
      // won't resolve, such as a dangling symlink, could redirect the write.
      if (lstatSync(current, { throwIfNoEntry: false })) {
        throw new Error(`can't resolve ${current}`);
      }
      const parent = dirname(current);
      if (parent === current) throw new Error(`can't resolve ${path}`);
      tail.push(basename(current));
      current = parent;
    }
  }
}
