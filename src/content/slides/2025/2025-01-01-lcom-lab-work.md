---
title: "LCOM laboratory work: getting started"
description: Support material for my practical LCOM classes at FEUP.
tags: ['lcom', 'feup']
---

class: center, middle, inverse, small-images

# LCOM laboratory work: getting started

L.EIC, 2nd year, FEUP 2025

Bruno Mendes

---

class: center, middle, inverse, small-images

This is my own support material for my *practical* classes. The theoretical slides+lab guides are your primary source of information.

---

class: center, middle, inverse

### Desiderata

---

### Course prerequisites

I expect you to have aced the following course units:

- Programming
    - The C language
- Computer Architecture
    - How a computer works, namely memory and I/O management
- Operating Systems
    - How a kernel works; how programs are compiled
- Software Design and Testing Laboratory
    - How to design a high-level application; version-control systems

If you are not familiar with these topics, you **must** use these first classes to catch up! Speak up.

---

### Course objectives

- Develop **low-level programming** skills
    - You'll interface with HW devices in C
    - Your programs will adhere to a binary communication protocol
    - You'll be prepared to transition to a embedded world later on if you enjoy this kind of work
- Design and **implement performant reactive applications from scratch**
    - Using event-driven programming without any fancy library
    - Leveraging the capabilities of the I/O devices you'll learn how to interface with
- Improve your **problem solving skills**
    - After all, this is a highly practical engineering course
    - The project may be the most fun you'll have in the BSc

---

### Code of conduct

- You shall implement **communication protocols that haven't changed for decades (mid 1980s @ IBM)**
    - There is plenty of material available besides the course labs, I recommend [osdev](https://wiki.osdev.org) if you want to dig further
    - Of course, the theoretical slides+lab guides should be your primary source of information
- You may be *tempted* to skip some **mandatory learning steps**...
    - From works of previous years to LLMs and code-assistant tools, there are a lot of tools to save you time...
- My advice is **disable/refrain from using all of these helper tools**
    - You'll have plenty of time throughout your life to be more productive with these; now it is the time to learn the fundamentals
    - And of course, you will **fail** this course or be penalized if we suspect of plagiarism

---

class: center, middle, inverse

### Our plan

---

### Agenda

- **1st part: "labs"**
    - [1w] Lab 0: Setting up the environment + misc topics
    - [2w] Lab 2: The "timer" (i8254)
    - [2w] Lab 3: The "keyboard" (KBC/i8042, or the "PS/2 controller")
    - [1w] Lab 4: The "mouse" (KBC/i8042, or the "PS/2 controller")
    - [1w] Lab 5: The "graphics card" (VESA BIOS functions)
- **2nd part: project**
    - [parallel] Lab 6: The real-time clock (RTC)
    - [parallel] Lab 7: The serial-port (UART)
    - [parallel] Application-level code
    - [parallel] Any topic you want discussed

---

### How you'll work

- In groups of 4
    - You'll have a shared GitLab repository already initialized with a basic structure
- Here and at home
    - Classes are not enough to finish the labs and solve problems
    - Use your time here to talk with me and the class assistant
- Communicating efficiently
    - Everyone should be able to solve the labs; do it in separate Git branches if you think it's best
    - The project will be large and will require a sound distribution of work

---

class: center, middle, inverse

### Lab 0: the development environment

---

### The need for programming for Minix

- You'll develop programs that **directly instruct the HW** to perform a certain way
    - You may change the frequency of the timer that sums up the time, or "steal" the keyboard data from the kernel interrupt handler...
- This is **not a safe, scoped endeavour** as in regular user-facing programs you are used to developing
    - In fact, in modern OSs these operations are not available for user-mode programs for safety and performance reasons (you'd need to develop a kernel extension/module)
    - Here comes Minix: an OS with a *micro-kernel* that allows privileged services in user mode to implement system functionality modularly
    - Our target environment is a completely emulated Intel PC with Minix installed

---

### Programming for a specific target

- You'll use **Intel-specific I/O instructions**, hidden by Minix system calls
- As such, you need to **compile your programs in the target platform**
    - You could cross-compile it, but it is out of the scope of this course
    - The labs and project will compile to binaries that must be executed with special privileges in Minix (via `lcom_run`)
- I recommend you **always have a Minix virtual machine instance running**
    - Leave it in the background and connect "remotely" to it via `ssh`, host `localhost` and port `2222`, user `lcom` (`ssh lcom@localhost -p 2222`)
    - Have a terminal ready to use to compile and test the labs in the virtual machine as you develop
    - Use your host code editor (e.g. Visual Studio Code) for development on a shared directory

---

### Proposed exercise

Write a single-file, *REPL* (read-eval-print loop) program capable of responding to the following commands, printing the result to the console:
- `and <uint1> <uint2>`: performs the AND bitwise operation with the 2 given operands
- `or <uint1> <uint2>`: performs the OR bitwise operation with the 2 given operands
- `set <uint> <bitpos>`: sets bit at given position in the given operand
- `unset <uint> <bitpos>`: clears bit at given position in the given operand
- `byte <uint> <bytepos>`: extract byte at given position (little-endian) in the given operand

Compile it in Minix using `clang` and verify it works. E.g:
- `and 3 5` should respond with `1`
- `set 4 1` should respond with `6`
- `byte 65534 1` should respond with `255` (notice that `65534 = 0xFF_FE`)
---

class: center, middle, inverse

### Lab 2: timer

---

### The LCF

- The LCOM framework leverages global utils such as `lcom_run` and `lcom_stop` that are installed in your VBox images
- It creates multiple entry points for your lab binaries, typically each lab function to implement
- It contains a set of unit tests for each lab function to make your life easier
- It intercepts your system calls and stops the program if the heuristics detect something is wrong
    - E.g. you did something in the wrong order...

> And with this all said, you might want to know that some years ago this course unit was taught with no emulation, no helper framework, targeting real Windows 98 devices found in DEEC... Lucky you.

---

### I/O architecture

- Each I/O device, e.g. the PC timer or the keyboard is controlled by **an integrated electronic circuit, called a controller**.
    - How they work internally is outside of the scope of this course (and of that of a software engineer, to be fair)
    - They are typically bundled in your motherboard
    - They interface with the CPU via an I/O bus (e.g. PCIe)
    - They interface with the HW device via a physical endpoint, e.g. USB connector
- There are many ways to interact with I/O controllers
    - Via memory-mapped I/O: a portion of the main memory is assigned to I/O devices
    - Via **special I/O instructions**: I/O uses a different address space
- We'll use Intel I/O instructions, `in` and `out`
    - These are available in Minix via the `sys_inb` and `sys_outb` system calls, respectively

---

### I/O controllers interface

- Most controllers have 3 kinds of registers
    - *Control*: used to request operations and/or configuration
    - *Status*: the state of the device
    - *Data*: for I/O *per se*.
- The register address, or *port* is an argument to the I/O instructions

```c
#define BIT(n) (1 << (n)) // a "bit mask" macro
```

```c
#define TIMER_CTRL 0x43 // the control register of the timer
#define TIMER0_ST // the status register of timer 0
#define TIMER_RB_CMD (BIT(7) | BIT(6))

// Writing to the i8254 control register
uint8_t cmd = TIMER_RB_CMD | ...; // assemble the word via bitwise operations
sys_outb(TIMER_CTRL, cmd); // write the word (should check the return status...)

// Reading from the i8254 status register
uint8_t st;
sys_inb(TIMER0_ST, &st); // read to st (should check the return status...)
                         // you may need a different function to read 1 byte...
```

---

### Working with the i8254

- The i8254 controls the 3 HW timers, `TIMER_0`, `TIMER_1` and `TIMER_2` (although we are mostly interested in the first one for counting the time)
- `0x40`, `0x41`, `0x42` are the data/status port for each timer, respectively
    - If you don't request the status to be put in that address, you'll read the current timer counter, which may be of no interest to you
- Your first task is to implement `timer_test_read_config`
    - You'll need to issue a "read-back command" to the `0x43` control register
    - Then the status will be put in the respective timer register, and you need to parse and display it
- Here and in all the following labs and assignments, **read the specification carefully!**

> Do you remember C unions? Can you give me an example of an implementation of that same memory layout in a different language?

---

### Interrupt handling

- It is not very practical to always be reading e.g. a status bit to understand if the data register has anything new relevant for us...
    - E.g. "polling" the KBC status register to understand if the user has pressed any key ready to be read from the data register.
- A PC leverages a **PIC (priority interrupt controller)** with interrupt request (IRQ) lines connected directly to I/O devices. When that controller detects that a line has been activated by a device, it informs the CPU
    - The CPU switches execution to an address where an "interruption handling routine" (or Interrupt Service Routine, ISR) is registered for that device
    - This routine calls kernel functions that may react to the notification appropriately, e.g. reading new data from a controller register
    - In Minix, this routine includes informing all subscribed processes via a SW interruption (e.g. a signal)

---

### Interrupt handling in Minix
- Privileged processes in user mode may subscribe to interruptions on a given IRQ line
    - `sys_irqsetpolicy` requires an IRQ line, a "policy" and the bit to activate in the message for this subscription (the input `hook_id`)
    - It modifies `hook_id` to be a random identifier for this subscripion, useful for modifying it or removing it later on

```c
int hook_id = 3; // or any bit position we'd like to check for
int timer_subscribe_int(uint8_t *bit_no) {
    *bit_no = hook_id; // tell the caller: "look for this bit in messages"
    return sys_irqsetpolicy(TIMER0_IRQ, IRQ_REENABLE, &hook_id);
}
```

```c
// Simplified example. Actual function calls provided in the lab.
int bit_no; struct message msg;
timer_subscribe_int(&bit_no); // Check the return code...
while (1) {
    receive(&msg); // Blocking call. Yields when any notification is received.
    if (msg & BIT(bit_no)) timer_ih();
}
```

- Your third task is to implement `timer_test_int`. You'll need to subscribe interrupts on IRQ line 0 and call a function each time you get an interrupt.

---

### Best practices

- Extract reusable functionality/symbols to functions/macros
    - Some `i8254`-related symbols are already defined for you in a header file; this will not be the case in the next laboratories and in the project
    - If you need to wait for a certain response in a max-trials fashion, it is good to encapsulate that
- Do not leak implementation details
    - If an application module, say `main.c` requests subscription to I/O interrupts on a given line via an interface defined in `timer.c`, it should then have a way of knowing how to receive them without direct access to `timer.c` internals (e.g. the `hook_id`)
- Do not allocate memory if not needed!
    - I've seen many allocate memory in the heap with `malloc` (or the likes) knowning the size of the array before-hand
    - A stack allocation is much much faster and you do not need to free that memory!

---

class: center, middle, inverse

### Remaining laboratories: some notes

You can use the same framework as in lab2, with a couple of caveats.

---

### Lab 3: keyboard

---

### Lab 4: mouse

---

### Lab 5: graphics card

---

### Lab 6: RTC

---

### Lab 7: UART

---
