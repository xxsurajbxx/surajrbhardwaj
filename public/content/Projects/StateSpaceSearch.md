# State Space Search Research Report

A research project implementing, benchmarking, and analyzing state-space search algorithms across serial CPU, GPU (CUDA), and distributed hybrid (MPI + CUDA) execution environments. The goal was to empirically evaluate how parallelism, memory trade-offs, and algorithmic design affect runtime, frontier exploration, and scalability at scale.

---

## Algorithms Implemented

| Algorithm | Backend |
| :--- | :--- |
| BFS | Serial CPU |
| Bidirectional BFS | Serial CPU |
| BFS | CUDA (GPU) |
| Bidirectional BFS | CUDA (GPU) |
| BFS | MPI + CUDA (Hybrid) |
| Bidirectional BFS | MPI + CUDA (Hybrid) |
| A\* (Manhattan heuristic) | CPU & CUDA (proof-of-concept) |

---

## Quick Start

**Prerequisites:** CUDA toolkit + drivers, MPI implementation (e.g. OpenMPI), `make`, `bash`.

```bash
# 1. Build all binaries
cd source
make

# 2. Run the full benchmark suite (writes results to source/output/)
bash runTests.sh
```

Results are written as tabular `.txt` files under `source/output/` (e.g. `table_1000line.txt`), with columns for total runtime, CUDA runtime, levels searched, nodes iterated, edges iterated, and path existence.

---

## Running Individual Executables

```bash
# Serial BFS
./bfs source/input/1000graph.csv 1 1000

# CUDA BFS
./bfscuda source/input/1000graph.csv 1 1000

# MPI + CUDA BFS (4 ranks)
mpirun -np 4 ./bfsmpicuda source/input/1000graph.csv 1 1000

# A* — CPU
./AStar path/to/puzzle.csv

# A* — CUDA (adjust PROBLEM_SIZE in source/resources/sharedFunctions.h before compiling)
./AStarcuda path/to/puzzle.csv
```

---

## Implementation Notes

**BFS (Serial)** — Classic queue-based level expansion. Linear per-node cost and minimal memory overhead; the baseline all GPU variants are measured against.

**BFS (CUDA)** — Pull-based GPU kernel where each thread checks incoming edges for visited neighbors. The naive variant launches threads for every node each iteration, producing large amounts of wasted work on sparse or chain-like graphs.

**BFS (MPI + CUDA)** — Graph partitioned across MPI ranks; each rank runs GPU kernels on its local partition and synchronizes visited state globally via `MPI_Allreduce` / `MPI_Bcast`. The hybrid variant prunes kernel launches to frontier nodes only, at the cost of an N-sized boolean tracking array.

**Bidirectional BFS** — Maintains two simultaneous frontiers and terminates early on a cross-frontier connection. CUDA variants come in naive (full-graph scan per iteration) and hybrid (frontier-pruned) flavors.

**A\*** — Manhattan-distance heuristic for N-puzzle (4×4 tested). Memory-intensive by nature; the MPI + CUDA variant was not completed due to memory and time constraints.

---

## Key Design Trade-offs

- **Small frontiers favor the CPU.** Kernel launch and MPI communication overhead cannot be amortized over shallow or narrow searches — serial BFS wins handily on `graph` and `line` inputs at small-to-medium sizes.
- **Idle-thread overhead on GPUs.** Launching a thread per node every iteration causes near-quadratic behavior on deep, chain-like graphs (`line` inputs), sometimes performing orders of magnitude worse than serial.
- **Hybrid pruning improves utilization but limits scale.** The MPI + CUDA frontier-tracking array is O(N) in memory; on the test hardware this caps scalability at roughly 100,000 nodes before memory exhaustion.

---

## Experimental Summary

| Input family | Characteristic | Best performer |
| :--- | :--- | :--- |
| `exhaustive` | Wide frontiers, large N (up to 500k nodes) | CUDA GPU |
| `graph` | Shallow frontiers, moderate branching | Serial BFS |
| `line` | Deep chains, minimal branching | Serial BFS (CUDA is orders-of-magnitude slower) |

Full experiment tables, verbatim numbers, and figures are in `doc/project.pdf`; a plaintext extraction is at `doc/project.txt`.

---

## Dataset Formats

**CSC (BFS variants)** — First line: `numValues,size`; second line: comma-separated `row_index` (length `numValues`); third line: comma-separated `col_ptr` (length `size+1`). Parser: `source/resources/csc_parser.cpp`.

**Adjacency / puzzle (A\*)** — Square matrix input. Parser: `source/resources/adjlist_parser.cpp`.

**Generators** — `graphGenerator.py`, `lineGraphGenerator.py`, `GenGemPuzzle.c`, and `makeUnsolvable.py` in `source/` reproduce the example input sets.

---

## Known Limitations

- MPI + CUDA hybrids exhaust memory beyond ~100,000 nodes due to the N-sized frontier tracking array.
- A\* implementations fail on puzzles larger than 4×4.
- Some benchmark counters may overflow for very large graphs; check `source/output/` logs for `N/A` values.

---

## Important Files

- **Build & test:** `source/Makefile`, `source/runTests.sh`
- **A\*:** `source/AStar/cpu/AStar.cpp`, `source/AStar/cuda/AStar_cuda.cu`
- **BFS:** `source/BFS/cpu/bfs.cpp`, `source/BFS/cuda/bfs_cuda.cu`, `source/BFS/cuda + mpi/bfs_mpi.cpp`
- **Utilities:** `source/resources/csc_parser.cpp`, `source/resources/adjlist_parser.cpp`, `source/resources/sharedFunctions.h`, `source/resources/rankingFunction.cpp`
- **Datasets:** `source/input/` — `*line.csv`, `*graph.csv`, `*exhaustive.csv`
- **Results:** `source/output/` — tables generated by `runTests.sh`
- **Report:** `doc/project.pdf` (plaintext extraction: `doc/project.txt`)
