# SPL Parser & Interpreter

A recursive-descent parser and tree-walking interpreter for **SPL** (Simple Programming Language), implemented in C++. Written for CS280 (Programming Language Concepts) at NJIT, Spring 2023.

---

## Overview

The project takes an SPL source file as input and executes it directly — there is no intermediate representation or AST. Parsing and interpretation are interleaved: values are computed on the way back up the recursive call stack.

The pipeline is:

```
Source file → Lexer (lex.cpp) → Parser/Interpreter (parserInt.cpp) → stdout
```

---

## Files

| File | Role |
|---|---|
| [lex.h](lex.h) | Token enum, `LexItem` class, lexer API |
| [lex.cpp](lex.cpp) | Lexer state machine (`getNextToken`) |
| [val.h](val.h) | `Value` class — runtime values and operators |
| [parserInt.h](parserInt.h) | Parser function declarations |
| [parserInt.cpp](parserInt.cpp) | Recursive-descent parser + interpreter |
| [prog3.cpp](prog3.cpp) | `main()` — file I/O and top-level dispatch |

---

## The SPL Language

### Types

SPL has three runtime types: integers, reals (doubles), and strings. Booleans exist internally (used by comparisons feeding `if` conditions) but are not a user-visible variable type.

### Variable Naming Convention

SPL uses **sigils** to declare variable types at the point of first assignment, rather than explicit type declarations:

| Sigil | Type | Example |
|---|---|---|
| `$` prefix | Numeric (`NIDENT`) | `$x = 42` |
| `@` prefix | String (`SIDENT`) | `@name = 'hello'` |

Plain identifiers (no sigil) are a **parse error** — this is an intentional design that makes variable type visible at every use site.

### Grammar

```
Prog       ::= StmtList
StmtList   ::= Stmt ; { Stmt ; }
Stmt       ::= AssignStmt | WritelnStmt | IfStmt
AssignStmt ::= Var = Expr
WritelnStmt::= writeln ( ExprList )
IfStmt     ::= if ( Expr ) { StmtList } [ else { StmtList } ]
Var        ::= NIDENT | SIDENT
ExprList   ::= Expr { , Expr }

Expr       ::= RelExpr [ (-EQ | ==) RelExpr ]
RelExpr    ::= AddExpr [ (-LT | -GT | < | >) AddExpr ]
AddExpr    ::= MultExpr { (+ | - | .) MultExpr }
MultExpr   ::= ExponExpr { (* | / | **) ExponExpr }
ExponExpr  ::= UnaryExpr { ^ UnaryExpr }
UnaryExpr  ::= [+ | -] PrimaryExpr
PrimaryExpr::= NIDENT | SIDENT | ICONST | RCONST | SCONST | ( Expr )
```

### Operators

**Numeric operators** (work on integers and reals):

| Token | Symbol | Meaning |
|---|---|---|
| `PLUS` | `+` | Addition |
| `MINUS` | `-` | Subtraction |
| `MULT` | `*` | Multiplication |
| `DIV` | `/` | Division |
| `EXPONENT` | `^` | Exponentiation (right-associative) |
| `NEQ` | `==` | Numeric equality |
| `NGTHAN` | `>` | Numeric greater-than |
| `NLTHAN` | `<` | Numeric less-than |

**String operators**:

| Token | Symbol | Meaning |
|---|---|---|
| `CAT` | `.` | Concatenation |
| `SREPEAT` | `**` | String repetition (string × integer) |
| `SEQ` | `-eq` | String equality |
| `SGTHAN` | `-gt` | String greater-than (lexicographic) |
| `SLTHAN` | `-lt` | String less-than (lexicographic) |

The string comparison operators (`-eq`, `-gt`, `-lt`) are prefixed with `-` and use a word suffix, borrowing the convention from shell scripting.

### Comments

Lines beginning with `#` are comments (shell-style, single-line only).

### String Literals

Strings are delimited by single quotes (`'...'`). Newlines inside a string literal are a lexer error.

---

## Architecture

### Lexer (`lex.cpp`)

The lexer is a hand-written **finite automaton** with the following states:

| State | Description |
|---|---|
| `START` | Initial / between tokens |
| `INID` | Inside an identifier (including `$` and `@` sigils) |
| `INSTRING` | Inside a single-quoted string literal |
| `ININT` | Inside an integer constant |
| `INFLOAT` | Inside a real constant (after seeing `.`) |
| `INCOMMENT` | Inside a `#` comment (discarded until newline) |
| `INSCOMPARE` | Recognizing `-eq`, `-gt`, or `-lt` after a `-` |

**Key decisions:**

- **Single-character lookahead via `in.peek()`** is used in several places: to distinguish `=` (assignment) from `==` (equality), `*` (multiply) from `**` (string repeat), and to begin the string comparison arm after `-`.
- **`in.putback(ch)`** is used when the automaton overshoots — reads one character too many to know the current token is complete, then returns the extra character to the stream.
- Sigil-typed identifiers (`$`, `@`) reuse the `INID` state. The sigil is consumed as part of the lexeme and later used by `id_or_kw` to set the correct token type (`NIDENT` or `SIDENT`).
- The `INSCOMPARE` state is entered when `-` is followed by `e`, `l`, or `g` — the only characters that could start a string comparison keyword. Any other character after `-` produces `MINUS`.

### Parser / Interpreter (`parserInt.cpp`)

The parser is a **recursive-descent** parser. Each grammar rule maps to a C++ function that returns `bool` (parse success) and (for expression rules) a `Value&` out-parameter carrying the computed result.

**Token buffering:** The parser maintains a one-token pushback buffer (`Parser::pushed_back` / `Parser::pushed_token`). This is the standard LL(1) technique — when a function reads a token that belongs to the caller, it pushes it back. The implementation uses `abort()` if a second push is attempted, catching bugs where the grammar would require more than one token of lookahead.

**Operator precedence** is encoded structurally in the grammar itself, lowest to highest:

1. `Expr` — equality (`==`, `-eq`)
2. `RelExpr` — comparison (`<`, `>`, `-lt`, `-gt`)
3. `AddExpr` — additive (`+`, `-`, `.`)
4. `MultExpr` — multiplicative (`*`, `/`, `**`)
5. `ExponExpr` — exponentiation (`^`)
6. `UnaryExpr` — unary sign (`+`, `-`)
7. `PrimaryExpr` — literals, variables, parenthesized expressions

**Right-associativity of `^`:** `ExponExpr` calls itself recursively (`ExponExpr` → `UnaryExpr ^ ExponExpr`) rather than looping, giving right-to-left evaluation. All other binary operators use a `while` loop, giving left-to-right evaluation.

**Symbol table:** Two `map<string, ...>` globals are used:
- `defVar` — tracks whether a variable has been assigned (`bool`), used to catch use-before-define.
- `SymTable` — maps variable names to their token type (`NIDENT` or `SIDENT`), used for type checking.

**Error recovery:** The parser does **not** recover from errors. On the first parse error, `ParseError` increments a counter and the calling function returns `false`, which propagates upward and halts interpretation. This is appropriate for a simple interpreter where partial execution of an erroneous program would produce undefined state.

### Value System (`val.h`)

`Value` is a tagged union over `{VINT, VREAL, VSTRING, VBOOL, VERR}`. All four storage fields (`Itemp`, `Rtemp`, `Stemp`, `Btemp`) are always allocated — this avoids a `union` at the cost of slightly more memory per value, which is acceptable for an interpreter of this scale.

Type-checking on access is strict: `GetInt()`, `GetReal()`, etc. throw a C-string exception if the requested type doesn't match. Arithmetic operators on `Value` are overloaded as member operators (`+`, `-`, `*`, `/`, `==`, `<`, `>`, `^`) plus named methods for string operations (`Catenate`, `Repeat`, `SEqual`, `SGthan`, `SLthan`).

The `<<` operator on `Value` uses `fixed << showpoint << setprecision(1)` for reals, ensuring output like `3.0` rather than `3`.

---

## Building

```bash
g++ -std=c++17 -o spl prog3.cpp parserInt.cpp lex.cpp
```

## Running

```bash
./spl <source_file>
```

On success:
```
Successful Execution
```

On failure:
```
1. Line # N: <error message>
...
Unsuccessful Interpretation
Number of Errors N
```

---

## Design Tradeoffs

**No AST.** Values are computed on the way out of the recursive call stack rather than building a tree and walking it separately. This simplifies the implementation considerably but makes it impossible to add multi-pass features (optimization, type inference, closures) without a significant rewrite.

**Interleaved parse and interpret.** A syntax error stops execution immediately — there is no way to detect all errors in a program before starting to run it. A two-pass design (parse to AST, then interpret) would allow full error reporting before any side effects occur.

**Global symbol table.** `defVar` and `SymTable` are global `std::map` instances. SPL has no function definitions or nested scopes, so this is sufficient, but it would need to become a scope stack to support any form of lexical scoping.

**No integer/real coercion.** The `Value` operators do not silently promote integers to reals. Mixed-type arithmetic (`$x = 1 + 2.5`) would need explicit handling in the operator implementations to avoid a type error — whether this is the intended behavior is determined by what the `Value` operator bodies do (not fully visible in this snapshot, but the type fields are separate and checked strictly).

**Single-file lexer errors are non-recoverable.** The lexer returns `ERR` on bad input but does not skip tokens or resynchronize. The parser treats an `ERR` token as a fatal error, so a single bad character stops the whole program.

**`abort()` on double pushback.** Using `abort()` rather than a graceful error makes double-pushback a hard crash during development, which is useful for catching grammar bugs but means any latent bug would crash a production run rather than reporting an error.
