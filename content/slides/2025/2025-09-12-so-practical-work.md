---
title: "SO practical work: getting started"
description: Support material for my practical SO classes at FEUP.
---

class: center, middle, inverse, small-images

# SO laboratory work: getting started

L.EIC, 2nd year, 1st Semester, FEUP 2025

Bruno Mendes

---

class: center, middle

This is WIP for now!

---

class: center, middle, inverse, small-images

This material is designed to support practical classes. Your primary sources of information are the theoretical slides available on Moodle. These slides are meant to complement those resources and should be used alongside them, either after reading or while reviewing them in parallel.

---

class: center, middle, inverse

### Desiderata

---

### Course prerequisites

I expect you to have aced the following course units:

- Programming Fundamentals
    - Computational thinking
- Programming
    - The C language
- Computer Architecture
    - Memory layers: registers, main memory (stack)

If you are not familiar with these topics, you **must** use these first classes to catch up! Speak up.

---

### Course objectives

- Learn **how an OS is implemented**
  - How its functionality is split into layers
  - The protection and encapsulation principles that motivate its API
- Learn about **core OS services**
  - How they allow functionality to be developed easily in user space
- Exercise **systems-level programming**
  - Interact with POSIX/libc APIs in Linux
---

### Grading

- 100%: Exam
  - 1 intermediate test in Moodle covering half of the syllabus (50%)
  - 1 final test in Moodle covering the other half of the syllabus (50%)
  - Both with a theorethical and a practical part
  - You'll have to write code in the practical part

> The exercises you'll tackle in class will be essential for the practical section of the tests.

---

class: center, middle, inverse

### Our plan

---

### TPs Agenda

- [1w] F0: Shell
- [2w] F1/F2: C Programming Language
- [2w] F3: File manipulation (libc: fread, fwrite, ...)
- [2w] F4: File manipulation (kernel API: open, read, write, ...)
- [2w] F5: Processes (exec, fork, ...)
- [2w] F6: IPC (pipes, shared memory, ...)
- [1w] F7: Threads (management, synchronization, ...)
---

### How you'll work

- Individually
  - But I don't mind if you gather in groups and discuss the exercises with colleagues
  - Do not skip exercises!
  - Do not use AI! Exercise your mind.
- Responsibly
  - You are adults, I expect you to behave as such
  - If you miss a class, it's your responsibility to catch up
  - If you have questions, ask me (during class, or by email)

---

### What OS do I need?

- **Linux** is your best option
  - UNIX; very POSIX-compliant, the most reliable environment for this course
  - You can install it in a VM (e.g., VirtualBox) or dual-boot it
  - I recommend Ubuntu or Fedora
- A Mac is fine, but you might want to use *bash* instead of *zsh*
  - macOS is UNIX but not fully POSIX-compliant, so some things might be slightly different
  - For example, system utilities are not GNU versions and might have different flags
- Windows will **not** work for this course

---

class: center, middle, inverse

### F0: Shell

---

### What's a shell?

- One of the main ways to interact with an OS is via direct command input (*CLI*)
- A *shell* is an interactive command interpreter (REPL)
  - Has some built-in commands (*cd*, *exit*, ...)
  - Mostly delegates functionality to user programs (*ls*, *grep*, ...)
- Some common examples include *bash*, *zsh* and *fish*
  - *bash* is the most commonly used and very POSIX-compliant
  - *zsh* is fine; *fish* is not POSIX-compliant, so please skip it for this course

```bash
#!/usr/bin/env bash
for i in {1..5}; do
  echo "Iteration $i"
done
```

```sh
$ chmod +x myscript.sh
$ ./myscript.sh
```

---

### Bash + GNU utilities 101

```bash
# Print the contents of a directory
$ ls -l <mydir>

# Print current working directory
$ pwd

# Change current working directory
$ cd <mydir>

# Write the contents of a file to another file
# The `>` operator redirects output to a file
$ cat <file1> > <file2>

# Search for a pattern in a file
# The `|` operator pipes the output of one command to another
$ cat <file> | grep <pattern>

# Environment variables are accessible by programs
$ echo $HOME
$ export MYVAR="myvalue"
$ env

# The "PATH" variable is special
# It lists directories where the shell looks for executables
# e.g. /usr/bin, /bin, /usr/local/bin, ...
$ echo $PATH
```

---

### Your best friend

- The best way to know how a system API (either system program or libc function) works is to read its manual page
- You can access it via the `man` command

```bash
man [page] <topic> # e.g. `man 1 write` should give you
                   # the manual for the write system binary
                   # 
                   # `man 2 write` should give you
                   # the manual for the write libc function
```

```txt
grep(1) — Linux manual page

NAME

       grep - print lines that match patterns

SYNOPSIS

       grep [OPTION]... PATTERNS [FILE]...
       grep [OPTION]... -e PATTERNS ... [FILE]...
       grep [OPTION]... -f PATTERN_FILE ... [FILE]...

DESCRIPTION

       grep searches for patterns in each FILE. [...]
```

---

class: center, middle, inverse

### F1/F2: C Programming Language

---

### Where we are

- You already know C from the Programming course
  - But you probably abused some of C++ features and might need a refresher
- Depending on who you ask, C might be considered a high-level or low-level language
  - It is a high-level language because it abstracts away many low-level details (CPU instructions, architecture-specific features, ...)
  - It is a **low-level language** because it provides direct access to memory and hardware (e.g., pointers, bitwise operations)
- In any case, C is historically **the language of choice for systems programming**
  - It is used to implement operating systems, embedded systems, and performance-critical applications
  - Rust might be taking over this role in the future, but C is still very relevant - the Linux kernel is as of now mostly C/ASM with a hint of Rust

---

### How a program is compiled

- You write some code in a `.c` file
- The C compiler (e.g. `gcc`) performs:
  - **Preprocessing**: handles directives like `#include` and `#define`
  - **Code analysis**: checks for syntax and semantic errors (based on a AST)
  - **Compilation**: translates C code to assembly code (architecture-dependent file, `.s`)
  - **Assembly**: converts assembly code to position-independent machine code (object file, `.o`)
  - **Linking**: combines object files and libraries into an executable (binary, e.g., ELF format)
- The loader (e.g. `ld.so`) loads the executable into memory and starts its execution when the shell calls `execve()`

```bash
$ gcc -o myprogram myprogram.c # you might need to link some libraries
                               # e.g., `-lm` for the math library
$ ./myprogram
```

---

### Beyond basic programs

- In the real world, code must be modular and reusable
- C provides several mechanisms to achieve this:
  - **Header files** (`.h`): declare functions, macros, constants, and data types
  - **Source files** (`.c`): define the actual implementation of functions and data structures
  - **Static libraries** (`.a`): collections of object files that can be linked into programs at compile time
  - **Dynamic libraries** (`.so`): shared libraries that are loaded at runtime, allowing for code reuse and memory efficiency
  
> There are many tools to help you manage complex C projects, such as `make`. They abstract way some of the complexities of manually resorting to `gcc`, `ar`, etc on ever-growing projects.

---

### Memory: the big monster (1/2)

- You **must** deal with memory manually in C
- Under the hood, your data will be stored in different memory segments:
  - The **registers**: e.g. local variables and function arguments with size up to arch-width (probably 64 bits)
    ```c
      int a = 42; // possibly stored in a register, if the function is small
    ```
  - The **stack**: e.g. local variables and function arguments with known size; get automatically "freed" when the block ends
    ```c
      int arr[100]; // stored in the stack
    ```
  - The **heap**: e.g. dynamically allocated memory with unknown size; you must manually free it when done; less efficient
    ```c
      int size;
      scanf("%d", &size); // be careful!
      int *ptr = malloc(size * (sizeof int));
      if (ptr == NULL) exit(1);
      some_use(ptr);
      free(ptr);
    ```

---

### Memory: the big monster (2/2)

- Pointers allow you to directly manipulate memory addresses
  - A pointer is a variable that stores a memory address
  - You can use pointers to create complex data structures (e.g., linked lists, trees) and to manage dynamic memory
  - Pointer arithmetic allows you to navigate through arrays and memory blocks
  ```c
    int a[2] = {42, 43}; // `a` is an array of 2 integers; 4+4 bytes
    int *p = &a; // `p` now holds the address of `a[0]`
    printf("%d\n", *(p + 1)); // prints `43`
  ```
- In C, all variables are passed by copy!
  - There is no "pointer in disguise" C++ `&` type qualifier
  - When you call some `f` declared as `int f(int* v)`, the location of `v` is copied to the stack/registers and passed to `f`
  - You must dereference it to access or modify the value it points to: `*v`

---

### Data layouts

- Composition might not be straightforward in C
  - A function returns one and only one value, likely in a fixed register
  - Primitive types (e.g., `int`, `char`, `float`) have a fixed size and unknown semantics in the context of your program
- Fortunately, C provides some mechanisms to create complex data types:
  - Structs (`struct`) allow you to group related data together -> size = sum of field sizes + padding
  - Unions (`union`) allow you to store different data types in the same memory location -> size = max of field sizes
  - Enums (`enum`) allow you to define a set of named integer constants, likely compiled as `int`
- `typedef` might come-in handy to create type aliases

---

class: center, middle, inverse

### F3/F4: File manipulation and more C

---

### Customizing the behavior of your program

- In the real world, programs read settings from many sources:
  - **Command-line arguments**: passed to the program when it is executed
  - **Environment variables**: inherited from the parent process (e.g., the shell)
  - **Configuration files**: read at runtime to load settings
- We'll focus on command-line arguments and environment variables for now

---

### Command-line arguments

- The `main` function can be defined as `int main(int argc, char *argv[])`
  - `argc` is the number of command-line arguments (including the program name)
  - `argv` is an array of strings (character pointers) representing the arguments
  
```c
#include <stdio.h> // for printf

int main(int argc, char *argv[]) {
    for (int i = 0; i < argc; i++) {
        printf("Argument %d: %s\n", i, argv[i]);
    }
    return 0;
}
```

```bash
$ ./myprogram arg1 arg2 arg3
Argument 0: ./myprogram
Argument 1: arg1
Argument 2: arg2
Argument 3: arg3
```

---

### Environment variables

- Environment variables are key-value pairs that can influence the behavior of processes
- You can access them using the `getenv` function from `stdlib.h`

```c
#include <stdio.h>  // for printf
#include <stdlib.h> // for getenv

int main() {
    char *path = getenv("PATH");
    if (path != NULL) {
        printf("PATH: %s\n", path);
    } else {
        printf("PATH variable not found.\n");
    }
    return 0;
}
```

```bash
$ ./myprogram
PATH: /usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/
```

---

### Strings

- Strings in C are arrays of characters terminated by a null character (`'\0'`)
- The standard library (`string.h`) provides several functions to manipulate strings

```c
#include <stdio.h>  // for printf
#include <string.h> // for strlen, strcpy, strcat, strcmp

int main() {
    char str1[8] = "Hello, "; // 7 chars + 1 for '\0'
                              // What happens if we write more than 7 chars?!
    char str2[] = "World!"; // the size is inferred
    
    // Concatenate str2 to str1 -> O(n + m)
    strcat(str1, str2);
    printf("Concatenated: %s\n", str1);
    
    // Length of the concatenated string -> O(n)
    printf("Length: %zu\n", strlen(str1));
    
    // Compare two strings -> O(n)
    if (strcmp(str1, "Hello, World!") == 0) {
        printf("Strings are equal.\n");
    } else {
        printf("Strings are not equal.\n");
    }
}
```

---

### Lists

- Linked lists are a common alternative to arrays that allows dynamic sizing; implemented ad-hoc by libraries
  - Each element (node) contains data and a pointer to the next node
  - They provide O(1) insertion and deletion time but O(n) access time
  
```c
#include <stdio.h>  // for printf
#include <stdlib.h> // for malloc, free

typedef struct Node {
    int data;
    struct Node *next;
} Node;

typedef List Node;

List* l_create(int data); // creates a node in the heap such that
                          // node->data = data and node->next = NULL
                          
List* l_push(List *head, int data); // returns a new node such that
                                    // node->data = data and node->next = *head
                                    
int l_at(List *head, int idx); // returns the data at position `idx`

void l_free(List *head); // frees all nodes in the list
```

---

### File manipulation with libc

- The C standard library (`stdio.h`) provides a high-level API for file manipulation
- Files are represented by the `FILE` type, which is an abstraction over system file descriptors

```c
#include <stdio.h>  // for FILE, fopen, fclose, fread, fwrite
#include <stdlib.h> // for exit

int main() {
    // Open a file for reading
    FILE *file = fopen("example.txt", "r");
    if (file == NULL) {
        perror("Error opening file");
        exit(EXIT_FAILURE);
    }

    // Read data from the file
    char buffer[256];
    size_t bytes_read = fread(buffer, sizeof char, (sizeof buffer) - 1, file);
    buffer[bytes_read] = '\0'; // Null-terminate the string
    printf("Read %zu bytes: %s\n", bytes_read, buffer);

    // Close the file
    fclose(file);
    return 0;
}
```

---

### File manipulation with kernel API

- The POSIX standard provides a low-level API for file manipulation via system calls
- They provide more control over file operations but are less portable
  - E.g. you may modify the file access permissions, locking, etc
- Remember that directories are also files!

```c
#include <stdio.h>   // for perror
#include <stdlib.h>  // for exit
#include <fcntl.h>   // for open, O_RDONLY
#include <unistd.h>  // for read, write, close

int main() {
    // Open a file for reading
    int fd = open("example.txt", O_RDONLY);

    // Read data from the file
    char buffer[256];
    ssize_t bytes_read = read(fd, buffer, (sizeof buffer) - 1);
    buffer[bytes_read] = '\0'; // Null-terminate the string
    printf("Read %zd bytes: %s\n", bytes_read, buffer);

    // Close the file
    close(fd);
}
```

---

### Bitwise operations

- Whilst working with file permissions (see `stat`) and many other I/O-related tasks, you will need to manipulate bits directly

```c
int some_mask = 0x04; // binary: 0000 0100
                      // there are also octal literals (prefixed by 0, e.g `0777`)
                      // binary literals are not in the C standard
                      
// Activate bit 1
some_mask |= (1 << 1); // now some_mask is 0000 0110

// Deactivate bit 2
some_mask &= ~(1 << 2); // now some_mask is 0000 001

// Check if bit 2 is active
int active = (some_mask & (1 << 2)) ? 1 : 0; // active is 0

// Toggle bit 0 (via XOR)
some_mask ^= (1 << 0); // now some_mask is 0000 0000
```

- Storing data in bits is memory-efficient and fast
  - But it can be error-prone and hard to read, so use it wisely
  - Most of the times you define macros that abstract away the bitwise operations in the specific context

---

### Time in UNIX-land

- Time is often represented as the number of seconds since the "UNIX epoch" (January 1, 1970)
  - This is known as "Unix time" or "POSIX time"
- The `time.h` library provides functions to work with time and date

```c
#include <stdio.h>   // for printf
#include <time.h>    // for time, localtime, strftime

int main() {
    time_t now = time(NULL); // get current time in seconds since epoch
    struct tm *local = localtime(&now); // convert to local time structure

    char buffer[80];
    strftime(buffer, sizeof buffer, "%Y-%m-%d %H:%M:%S", local);
    printf("Current local time: %s\n", buffer);
    return 0;
}
```
