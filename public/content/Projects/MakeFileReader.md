# Makefile Reader

A C++ program that parses and executes a simplified subset of Makefile syntax.

## Overview

This tool reads a Makefile, resolves the build order based on target dependencies, validates that all dependency files exist, and executes each target's shell commands in the correct order.

## Usage

```
./make [makefile] [-d]
```

| Argument | Description |
|---|---|
| _(none)_ | Opens `makefile` in the current directory |
| `[makefile]` | Opens the specified file |
| `-d` | Enable debug output (must be the third argument) |

**Examples:**
```sh
./make                      # uses ./makefile
./make MyMakefile           # uses ./MyMakefile
./make MyMakefile -d        # uses ./MyMakefile with debug output
```

## How It Works

### Parsing

The program processes the file in four sequential passes:

1. **Line extraction** — reads all lines into a fixed array of 100 slots (`string lines[100]`)
2. **Target identification** — a line is a target if it does not start with `\t` (tab) or `\0` (null/empty); these are the `target: dep1 dep2 ...` lines
3. **Dependency extraction** — scans each target line for space-separated tokens after the colon; stores up to 10 dependencies per target
4. **Command extraction** — tab-indented lines following a target are collected as that target's shell commands; up to 100 commands per target

### Dependency Validation

Before executing anything, the program checks every dependency for every target. If a dependency is not itself a target, it attempts to open it as a file. If the file cannot be opened, an error is printed and the program exits without running any commands.

### Build Order Resolution

The program uses a simple iterative topological sort. It loops over all targets repeatedly and, on each pass, runs any target whose dependencies have all been marked complete (tracked in a `bool checklist[]`). A target is skipped if any of its dependencies is an un-completed target; otherwise its commands are executed and it is checked off.

This is not a true topological sort — it's O(n³) in the number of targets — but it is correct for acyclic dependency graphs and practical for small Makefiles.

Command execution uses `system()`, which runs each command string in a shell subprocess.

## Technical Decisions and Tradeoffs

### Fixed-size arrays over `std::vector`

All storage (lines, targets, dependencies, commands) uses stack-allocated arrays with hardcoded maximums (100 lines, 10 dependencies per target, 100 commands per target). This avoids dynamic allocation but imposes hard limits and will silently truncate or exhibit undefined behavior if those limits are exceeded.

### `goto` for dependency parsing

The inner dependency tokenizer uses a `goto label:` loop instead of a `while` or `for` loop. This is functionally equivalent to a loop that advances through space-separated tokens, but is harder to follow than a standard loop construct.

### No colon handling in dependency parsing

The dependency extraction reads from the first space in the raw target line (which sits just after the colon and target name). The colon itself is part of what gets trimmed later when target names are shortened. This works but couples the two parsing passes in a non-obvious way: dependencies are extracted before the target name is stripped, so the dependency array for index `i` is built from the raw `target: dep1 dep2` string.

### Iterative topological sort

The build ordering loop is O(n³): for each of n iterations, it scans all n targets and for each checks all dependencies against all targets. For the typical small Makefile this is negligible. A proper topological sort (Kahn's algorithm or DFS) would be O(V+E) but adds code complexity that is not warranted here.

### `system()` for command execution

Shell commands are passed directly to `system()`, which inherits the current environment and working directory. This is simple and correct for a Makefile executor, but `system()` is a blocking call — there is no parallelism between commands within a target, and no parallelism between independent targets (unlike real `make -j`).

### Debug mode

Passing `-d` as the third argument (after the filename) prints the raw file contents, line/target counts, and the resolved dependency list for every target before execution. This is useful for verifying the parser's output.

## Known Limitations

- Maximum 100 lines in the Makefile
- Maximum 10 dependencies per target
- Maximum 100 commands per target
- No variable/macro expansion (`CC`, `$(VAR)`, etc.)
- No pattern rules (`%.o: %.c`)
- No phony targets (`.PHONY`)
- No timestamp-based rebuild logic — all targets always run
- Cycle detection is absent; a circular dependency will cause an infinite loop
- The `-d` flag must be the third argument; placing it second is treated as the filename
