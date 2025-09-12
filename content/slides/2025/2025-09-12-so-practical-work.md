---
title: "SO practical work: getting started"
description: Support material for my practical Operating Systems classes at FEUP.
---

class: center, middle, inverse, small-images

# SO practical work: getting started

L.EIC, 2nd year, 1st Semester, FEUP 2025

Bruno Mendes

---

class: center, middle, inverse, small-images

This material is designed to support practical classes. Your primary sources of information are the theoretical slides available on Moodle. These slides are meant to complement those resources and should be used alongside them, either after reading or while reviewing them in parallel.

---

class: center, middle, inverse

### Desiderata

---

### Course prerequisites

I expect you to have aced the following course units:

- Programming Fundamentals (**FPro**)
    - Computational thinking
- Programming (**Prog**)
    - The C language
- Computer Architecture (**AC**)
    - Memory layers: registers, main memory (stack)

If you are not familiar with these topics, you **must** use these first classes to catch up! Speak up.

---

### Course objectives

- Learn **how an OS is implemented** -> theorethicals
  - How its functionality is split into layers
  - The protection and encapsulation principles that motivate its API
- Learn about **core OS services** -> theorethicals + practicals
  - How they allow functionality to be developed easily in user space
- Exercise **systems-level programming** -> practicals
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
- [2w] F6: IPC (pipes, signals, ...)
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
  - If you have questions, ask me (during class, or by email -> [bdmendes@fe.up.pt](mailto:bdmendes@fe.up.pt))

---

### What OS do I need?

- **Linux** is your best option
  - UNIX; very POSIX-compliant, the most reliable environment for this course
  - You can install it in a VM (e.g., VirtualBox) or dual-boot it
  - I recommend Ubuntu or Fedora
- A Mac is fine, but you might want to use *bash* instead of *zsh*
  - macOS is also UNIX but so some things might be slightly different
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
  - **Code generation**: translates C code to assembly code (architecture-dependent file, `.s`)
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
some_mask &= ~(1 << 2); // now some_mask is 0000 0010

// Check if bit 2 is active
int active = (some_mask & (1 << 2)) ? 1 : 0; // 0

// Toggle bit 0 (via XOR)
some_mask ^= (1 << 0); // now some_mask is 0000 0011
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

---

class: center, middle, inverse

### F5: Processes

---

### Processes

- At a high level, the materialization of a running program is called a *process*
  - It has its own memory space (virtual memory), file descriptors, and execution context (registers, stack, ...)
  - The kernel keeps its information in a data structure called *process control block* (PCB)
- A process may manage and communicate with other processes
  - A process that creates another process is called a *parent*; the created process is a *child*
  - One may create a process using the `fork()` system call
  - One may replace itself with another program using the `exec()` family of system calls
  - A parent may wait for a child to finish using the `wait()` family of system calls
- More advanced ways of communicating soon...

---

### Dispatching computations to processes

- Some tasks are naturally parallel and independent and can be split into multiple processes
  - E.g., a web browser typically spawns a new process for each tab

```c
#include <stdio.h>    // for printf, perror
#include <stdlib.h>   // for exit
#include <unistd.h>   // for fork, exec, _exit
#include <sys/wait.h> // for wait

int main() {
    pid_t pid = fork(); // create a new process
                        // might do so in bulk...
    if (pid < 0) {
        exit(EXIT_FAILURE);
    } else if (pid == 0) {
        // Child process; variables copied via copy-on-write (CoW)
        char *args[] = {"/bin/ls", "-l", NULL};
        execv(args[0], args); // replace child with `ls -l`
    } else {
        // Parent process
        int status;
        waitpid(pid, &status, 0); // wait for child to finish
        if (WIFEXITED(status)) {
            printf("Child exited with status %d\n", WEXITSTATUS(status));
        }
    }
}
```

---

class: center, middle, inverse

### F6: Inter-Process Communication (IPC)

---

### Why IPC?

- Processes are isolated from each other by the OS for security and stability
  - Each process has its own memory space, file descriptors, and execution context
- However, processes often need to communicate and share data
  - E.g., a web server process might need to communicate with a database process
- IPC mechanisms provide ways for processes to exchange data and synchronize their actions
  - Some IPC mechanisms are suitable for small amounts of data and low latency (e.g. pipes)
  - Others are suitable for larger amounts of data and more complex interactions (e.g. shared memory)
  - Many others: files, signals, message queues, sockets, ...
  
---

### Pipes

- A pipe is a unidirectional communication channel that can be used for IPC
  
```c
#include <stdio.h>    // for printf, perror
#include <stdlib.h>   // for exit
#include <unistd.h>   // for fork, pipe, read, write, close
#include <string.h>   // for strlen

int main() {
    int fd[2];
    pipe(fd);
    pid_t pid = fork();
    
    if (pid < 0) {
        exit(EXIT_FAILURE);
    } else if (pid == 0) {
        // Child process
        close(fd[0]); // Close unused read end
        const char *msg = "Hello from child!";
        write(fd[1], msg, strlen(msg));
        close(fd[1]); // Close write end
    } else {
        // Parent process
        close(fd[1]); // Close unused write end
        char buffer[256];
        ssize_t bytes_read = read(fd[0], buffer, (sizeof buffer) - 1);
        printf("Parent received: %s\n", buffer);
        close(fd[0]); // Close read end
    }
}
```

---

### Named pipes (FIFOs) (1/2)

- A named pipe (FIFO) is a special type of file that acts as a pipe
  - It can be used for IPC between unrelated processes
  - It is created using the `mkfifo()` system call or the `mkfifo` utility
- Supports bidirectional communication:
  - Many processes may write to the same pipe
  - Many processes may read from the same pipe, but the OS ensures that each message is read by only one reader
  
---

### Named pipes (FIFOs) (2/2)

```c
#include <stdio.h>    // for printf, perror
#include <stdlib.h>   // for exit
#include <unistd.h>   // for fork, read, write, close, unlink
#include <fcntl.h>    // for open, O_RDONLY, O_WRONLY
#include <string.h>   // for strlen
#include <sys/stat.h> // for mkfifo

int main() {
    const char *fifo_path = "/tmp/my_fifo";
    mkfifo(fifo_path, 0666); // create the FIFO with read/write permissions
    pid_t pid = fork();
    if (pid < 0) {
        exit(EXIT_FAILURE);
    } else if (pid == 0) {
        // Child process
        int fd = open(fifo_path, O_WRONLY);
        const char *msg = "Hello from child!";
        write(fd, msg, strlen(msg));
        close(fd);
    } else {
        // Parent process
        int fd = open(fifo_path, O_RDONLY);
        char buffer[256];
        ssize_t bytes_read = read(fd, buffer, (sizeof buffer) - 1);
        buffer[bytes_read] = '\0'; // Null-terminate the string
        printf("Parent received: %s\n", buffer);
        close(fd);
        unlink(fifo_path); // "delete" the FIFO
    }
}
```

---

### Signals

- Signals are a form of asynchronous notification sent to a process to notify it of an event
  - E.g., `SIGTERM` is sent to request a process to terminate gracefully - highly used e.g. by Kubernetes!
  
```c
#include <stdio.h>    // for printf, perror
#include <stdlib.h>   // for exit
#include <unistd.h>   // for fork, pause
#include <signal.h>   // for signal, SIGINT, SIGCHLD
#include <sys/wait.h> // for wait

// Provide a handler to this particular signal.
// Some handlers are non-reprogrammable (e.g., SIGKILL); handled by the OS.
void handle_sigterm(int sig) {
    printf("Caught SIGINT (signal %d). Exiting gracefully...\n", sig);
}

int main() {
    signal(SIGTERM, handle_sigint); // Register signal handler
    pause(); // Wait for signals
    return 0;
}
```

```bash
$ ./myprogram
$ ps # find its PID
$ kill -SIGINT <PID>
```

---

### Sockets

- Sockets provide a way for processes to communicate over a network
  - They can be used for IPC on the same machine (using Unix domain sockets) or between machines (using TCP/IP)
  - The `AF_UNIX` family is used for IPC on the same host machine

```c
int main(int argc, char* argv[]) {
    char buf[1024]; int sockets[2];
    socketpair(AF_UNIX, SOCK_STREAM, 0, sockets);
    int pid = fork();
    if (pid > 0) { /* parent */
        char string1[] = "In every walk with nature...";
        close(sockets[1]);
        write(sockets[0], string1, sizeof string1);
        read(sockets[0], buf, sizeof buf);
        printf("message from %d-->%s\n", getpid(), buf);
        close(sockets[0]);
        wait(NULL);
    } else { /* child */
        char string2[] = "...one receives far more than he seeks.";
        close(sockets[0]);
        read(sockets[1], buf, sizeof buf);
        printf("message from %d-->%s\n", getppid(), buf);
        write(sockets[1], string2, sizeof string2);
        close(sockets[1]);
    }
}
```

---

class: center, middle, inverse

### F7: Threads

---

### Why threads?

- Some tasks are very naturally tailored to be executed in parallel in the same process
  - E.g., a web server might spawn a new thread for each incoming request
  - Although in practice threads are not infinite and a thread pool is used (likely implemented via a queue)
- Threads are more lightweight than processes
  - They share the same memory space and file descriptors, which makes context switching faster
  - However, this also means that threads must be carefully synchronized, if they attempt access to shared data

---

### Creating and managing threads

- The POSIX threads (`pthreads`) library provides a standard API for creating and managing threads in C

```c
void* thread_function(void* arg) {
    char* message = (char*)arg;
    for (int i = 0; i < 5; i++) {
        printf("%s: iteration %d\n", message, i);
        struct timespec ts = {0, 500000000}; // 0.5 seconds
        nanosleep(&ts, NULL); // sleep for a while to simulate work
    }
    return NULL;
}

int main() {
    pthread_t thread1, thread2;
    const char* msg1 = "Thread 1";
    const char* msg2 = "Thread 2";

    if (pthread_create(&thread1, NULL, thread_function, (void*)msg1) != 0) {
        exit(EXIT_FAILURE);
    }
    if (pthread_create(&thread2, NULL, thread_function, (void*)msg2) != 0) {
        exit(EXIT_FAILURE);
    }

    pthread_join(thread1, NULL); // Wait for thread 1 to finish
    pthread_join(thread2, NULL); // Wait for thread 2 to finish
}
```

---

### Synchronizing threads

- You need to use a synchronization mechanism if you need a certain semantic when accessing shared data, e.g. you might want to ensure that only one thread can access a shared resource at a time
- Mutexes (mutual exclusion locks) are a common way to achieve this; semaphores and monitors are other options

```c
static int counter = 0; // shared resource
pthread_mutex_t counter_mutex = PTHREAD_MUTEX_INITIALIZER; // static initializer

void* increment(void* arg) {
    pthread_mutex_lock(&counter_mutex); // lock the mutex
    counter++; // critical section
    pthread_mutex_unlock(&counter_mutex); // unlock the mutex
                                          // what happens if we forget to do this?
}

int main () {
    pthread_t threads[10];
    for (int i = 0; i < 10; i++) {
        pthread_create(&threads[i], NULL, increment, NULL);
    }
    for (int i = 0; i < 10; i++) {
        pthread_join(threads[i], NULL);
    }
    printf("Final counter value: %d\n", counter);
    pthread_mutex_destroy(&counter_mutex); // destroy the mutex when done
}
```

---

class: center, middle, inverse

### What's next?

---

### Final remarks

- This was an introductory course on operating systems and systems programming
- You'll continue to explore some of these topics in upcoming curricular units, such as:
  - I/O management and low-level application design in **Computer Laboratory** (2nd year, 2nd semester) -> [lcom.bdmendes.com](https://lcom.bdmendes.com)
  - Networking in **Computer Networks** (3rd year, 1st semester)
  - Concurrency, parallelism and distributed computing in **Parallel and Distributed Programming** (3rd year, 2nd semester)
- See you soon!
