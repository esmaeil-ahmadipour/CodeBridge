import type { Options } from './types.ts';

export function defaultOptions(): Options {
  return {
    useGitignore: true,
    extensions: [],
    skipFolders: ['node_modules', 'dist', 'build', 'out', '__pycache__', 'venv', '.venv', '.git', '.dart_tool', '.idea'],
    skipFiles: ['*.log', '*.tmp', '.env*'],
    skipContains: ['.freezed.dart', '.g.dart', '.gr.dart', '.mocks.dart', 'generated'],
    includeHidden: false,
    maxFileKb: 0, // 0 = no limit
    redact: true,
    compact: false,
    header: true,
    tree: true,
    tokenEstimate: true,
    splitBytes: 0,
    hideImages: false,
    hideLocks: false,
    project: '',
    hideTests: false,
  };
}
