export interface InFile {
  path: string;
  size: number;
  text: string;
}

export type ProjectType = '' | 'nextjs' | 'react' | 'node' | 'nestjs' | 'python' | 'flutter'; // '' = not selected

export interface Options {
  useGitignore: boolean;
  extensions: string[]; // [] = all types
  skipFolders: string[];
  skipFiles: string[];
  skipContains: string[];
  includeHidden: boolean;
  maxFileKb: number; // 0 = no limit
  redact: boolean;
  compact: boolean;
  header: boolean;
  tree: boolean;
  tokenEstimate: boolean;
  splitBytes: number; // 0 = no split
  hideImages: boolean; // keep the path, drop the content of image files (e.g. SVG)
  hideLocks: boolean; // drop the content of the lock files of `project`
  project: ProjectType; // '' = not selected: lock and test content are never hidden
  hideTests: boolean; // drop the content of the test files of `project`
}

export interface Entry {
  path: string;
  size?: number;
  read: () => Promise<Uint8Array>;
}

export interface LoadStats {
  total: number;
  skipped: number; // ignored by .gitignore or skip rules or file type
  binary: number;
  large: number;
  kept: number;
}
