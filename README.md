Levgen-Parallel-Benchmarks
==========================

Simple parallel Roguelike level generation benchmark of Rust, C, D, Go and more. Speed will be measured and compared both between implementations and between them and their non-parallel equivalents, as will standard lines of code (sloc as defined by Github).

Rust is compiled with --opt-level=3

C is compiled with -O3 -lpthread

C++ is compiled with -O3 -pthread -std=c++11

If using Clang++, C++ may need to be compiled with -D__GCC_HAVE_SYNC_COMPARE_AND_SWAP_1 -D__GCC_HAVE_SYNC_COMPARE_AND_SWAP_2 -D__GCC_HAVE_SYNC_COMPARE_AND_SWAP_4 -D__GCC_HAVE_SYNC_COMPARE_AND_SWAP_8 , to avoid a bug in less-current versions of the LLVM.

D is compiled with -O -release -inline -noboundscheck

Nimrod is compiled with -d:release, and --threads:on if using the llvm one (the llvm doesn't support OpenMP).

Scala is run with ```target/start seed``` after running ```sbt add-start-script-tasks start-script``` in the scala folder.

C# can be compiled with .NET core using `dotnet run 1234` (remember to run `dotnet restore` first). Use more aggressive compilation options for better performance.

Node can be run with `npm start 1234` (remember to run `npm install` first)

They must be run with the seed as a command line parameter, like ./PC 123.
