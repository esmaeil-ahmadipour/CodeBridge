import type { ProjectType, Options } from './types.ts';

const NPM = ['package-lock.json', 'npm-shrinkwrap.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lock'];

/** Lock files per project type the user can pick. */
export const LOCK_FILES: Record<Exclude<ProjectType, ''>, string[]> = {
  nextjs: NPM,
  react: NPM,
  node: NPM,
  nestjs: NPM,
  python: ['poetry.lock', 'Pipfile.lock', 'uv.lock', 'pdm.lock'],
  flutter: ['pubspec.lock', 'Podfile.lock'],
};

export const LOCK_PROJECTS = Object.keys(LOCK_FILES) as Exclude<ProjectType, ''>[];

const IMAGE_EXTS = ['.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.bmp', '.ico', '.tif', '.tiff'];

const JS_TEST = /\.(test|spec)\.[cm]?[jt]sx?$/i;

/** Test folders (matched on any directory segment) and test file names, per project type. */
const TEST_RULES: Record<Exclude<ProjectType, ''>, { dirs: string[]; file: RegExp }> = {
  nextjs: { dirs: ['__tests__', 'test', 'tests', 'e2e'], file: JS_TEST },
  react: { dirs: ['__tests__', 'test', 'tests', 'e2e'], file: JS_TEST },
  node: { dirs: ['__tests__', 'test', 'tests', 'e2e'], file: JS_TEST },
  nestjs: { dirs: ['test', 'tests', '__tests__', 'e2e'], file: /\.(test|spec|e2e-spec)\.[cm]?[jt]s$/i },
  python: { dirs: ['tests', 'test'], file: /(^|\/)(test_[^/]*|[^/]*_test|conftest)\.py$/i },
  flutter: { dirs: ['test', 'integration_test'], file: /_test\.dart$/i },
};

export function isTestFile(path: string, project: Exclude<ProjectType, ''>): boolean {
  const r = TEST_RULES[project];
  const dirs = path.toLowerCase().split('/').slice(0, -1);
  return dirs.some((d) => r.dirs.includes(d)) || r.file.test(path);
}

export type HideOpts = Pick<Options, 'hideImages' | 'hideLocks' | 'project' | 'hideTests'>;

/**
 * Which "content hidden" rule applies to a file, or null.
 * Lock and test content are only ever hidden when a project type was chosen.
 */
export function hiddenKind(path: string, o: HideOpts): 'image' | 'lock' | 'test' | null {
  const name = (path.split('/').pop() || '').toLowerCase();
  if (o.hideImages && IMAGE_EXTS.some((e) => name.endsWith(e))) return 'image';
  if (o.hideLocks && o.project && LOCK_FILES[o.project].some((l) => l.toLowerCase() === name)) return 'lock';
  if (o.hideTests && o.project && isTestFile(path, o.project)) return 'test';
  return null;
}
