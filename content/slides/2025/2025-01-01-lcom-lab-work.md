---
title: "LCOM laboratory work: getting started"
description: Support material for my practical LCOM classes at FEUP.
tags: ['class', 'feup']
---

class: center, middle, inverse, small-images

# LCOM laboratory work: getting started

L.EIC, 2nd year, FEUP 2025

Bruno Mendes

---

class: center, middle, inverse, small-images

This material is designed to support practical classes. Your primary sources of information are the theoretical slides and lab guides available on Moodle. These slides are meant to complement those resources and should be used alongside them, either after reading or while reviewing them in parallel.

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

### Grading

- 60%: Project
  - Reactive application from scratch using the devices you will interact with in the labs
  - Graded by a group of 2 professors, one of them your class professor
  - The labs are not *directly* evaluated
- 40%: Tests
  - Theoretical+practical, multiple choice
  - Dates available in Moodle

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

### Lab 3: keyboard

---

### Working with the i8042 ("KBC")

- Controls both the keyboard and the mouse
    - For this lab, we are interested in reading the keys pressed by the user
- Exposes 3 main interfaces
    - *Status*, at `0x64`, from where you'll read the state
    - *Input Buffer*
        - at `0x64` listening to command "identifiers"
        - at `0x60` listening to command arguments
    - *Output Buffer* at `0x60`, from where you'll read keys pressed (later mouse displacements)
---

### Reading data

- Via *interrupts*: you already know this!
    - But of course, the IRQ line is different from the timer
    - Now you need to add the `IRQ_EXCLUSIVE` policy upon subscription, otherwise the kernel will "steal" keys from you

- Via *polling*: check periodically if new data is available to read

```c
uint8_t st, data;
while(...) {
    util_sys_inb(0x64, &st); // read the status register
    if (st & BIT(0)) { // output buffer full
        util_sys_inb(0x60, &data); // fetch data from OB
        printf("User pressed key 0x%x, data"); // or any other handle
                                               // there are keys with 2 bytes...
    }
    microdelay(20000); // let the CPU breathe! (e.g. context switch)
}
```

---

### Issuing commands

- You might notice weird things while polling...
    - The IH steals keys from you, or you can no longer type in the shell after your program exits...
- Modify the KBC configuration (the "command byte") to enable/disable interrupts as you please to handle this

```c
void disable_interrupts() {
    uint8_t cmd_byte;
    // ommited: check if IBF is cleared
    sys_outb(0x64, 0x20); // issue "read command byte"
    util_sys_inb(0x60, &cmd_byte); // current command byte
    cmd_byte &= ~BIT(0); // clear INT bit
    sys_outb(0x64, 0x60); // issue "write command byte"
    sys_outb(0x60, cmd_byte); // new command byte is our argument
}
```

- You can do better than this code
    - Use macros for better readability
    - Check the return values of the system calls

---

class: center, middle, inverse

### Lab 4: mouse

---

### The i8042 and the mouse

- As you know, the KBC also controls the mouse
    - However, the `AUX` bit of the status register will be set when available data is from the mouse
    - The IRQ line is also different
- You are interested in reading mouse displacements
    - Each "mouse packet" contains **3 bytes**
        - 1st: metadata, such as sign of x, sign of y, first byte flag...
        - 2st: 8-lsb of X-delta
        - 3st: 8-lsb of Y-delta
    - Since there isn't a 9-bit type in C, you'll need to convert the deltas to 16-bit using **2-complement**
    - You only read one byte at a time, how to make sure we are **"synced"**?
- You need to issue `ENABLE_DATA_REPORTING` to receive mouse data via interrupts (stream mode)
---

### Issuing commands

- You can issue mouse-specific commands
    - Via the `0xD4` command + 1 or more arguments
    - After each byte (either command or argument) the KBC will ACK (`0xFA`) or NACK (`0xFE`); should retry entire command if NACK
- One use case is switching from "stream mode" (the default) to "remote mode" (sort-of polling/on demand)

```c
void issue_mouse_cmd(uint8_t mouse_cmd) {
    uint8_t response;
    // ommited: wait for IBF cleared
    sys_outb(0x64, 0xD4);
    util_sys_inb(0x60, &response);
    if (response != 0xFA) {issue_mouse_cmd(mouse_cmd); return;}
    sys_outb(0x60, mouse_cmd);
    util_sys_inb(0x60, &response);
    if (response != 0xFA) {issue_mouse_cmd(mouse_cmd); return;}
}

void read_loop() {
    issue_mouse_cmd(0xF5); // disable data reporting
    issue_mouse_cmd(0xF0); // set remote mode
    while(...) {
        issue_mouse_cmd(0xEB); // read data
        read_mouse_pckt(); // read from output buffer the 3 bytes
    }
}
```

---

class: center, middle, inverse

### Lab 5: graphics card

---

### Direct I/O access?

- Video cards are complicated...
  - They have multiple cores, highly optimized memory management
  - It would be innefficient to expose all functionality via direct I/O access
- In the 1980s, manufacturers agreed on a set of high-level functions to access video card functionality
  - Usually stored in a ROM in the video card
  - These days there are more advanced standards such as DirectX or OpenGL (you will have a course unit for the latter next year!)
  - However we'll focus on **VBE 2.0** for which VirtualBox has great emulation

---

### BIOS functions

- The *Video Electronics Standards Association BIOS Extension* specifies a set of BIOS functions for interaction with video card functions
  - BIOS functions are usually stored in a ROM, and are commonly called the PC *firmware*
- You can invoke BIOS functions via a software interrupt (`INT` instruction in Intel ASM)
  - For video functions, that will be `INT 0x10`
  - For VBE-specific functions, the AH register must be set to `0x4F`
- But of course, we won't do assembly directly here
  - Use the `sys_int86` system call instead

---

### Switching to video mode

- The first VBE function you'll need is `SET MODE (0x02)`
  - It allows you to exit text mode and enter a graphics mode
  - You have a list of common VBE modes in the lab handout

```c
void set_video_mode(uint16_t mode) {
  struct reg86 args;
  memset(&args, 0, sizeof(args)); // why do we need this?

  args.ah = 0x4F; // VBE function
  args.al = 0x02; // "set mode" function
  args.bx = BIT(14) | mode; // given mode with linear frame model
  args.intno = 0x10; // BIOS video service

  sys_int86(&args);

  // The function changes registers according to return status
  // AL != 0x4F -> function not supported
  // AH != 0x0 -> error
  if (args.al != 0x4F || args.ah != 0x00) panic();
}
```

---

### Mapping the frame buffer

- After you switch to video mode you'll be greeted with a nice black screen
  - It would be great to be able to draw something, though
- Solution: map the physical video memory to a protected address and use the linear frame model afterwards

```c
uint8_t* map_graphics_vram(uint16_t mode) {
  vbe_mode_info_t mode_info;
  vbe_get_mode_info(mode, &mode_info); // calls the 0x01 VBE function underneath

  struct minix_mem_range mr;
  memset(&mr, 0, sizeof(mr));

  mr.mr_base = (phys_bytes)mode_info.PhysBasePtr;
  mr.mr_limit = mr.mr_base + ...; // how many pixels do you need, given the mode?

  // Request permission for our process to map memory
  sys_privctl(SELF, SYS_PRIV_ADD_MEM, &mr);

  return vm_map_phys(SELF, (void *)mr.mr_base, mr.mr_limit - mr.mr_base);
}
```
---

### Pointer arithmetic

- After you have a pointer to the graphics memory, you can start painting
  - You need to be aware of C pointer behaviour, e.g. adding 1 to a `int*` actually increments the memory location by 4 bytes (size of int)
  - To avoid this trouble, cast to `uint8_t*` and do the arithmetic yourself

```c
void draw_pixel(uint16_t x, uint16_t y, uint32_t color) {
  if (x >= mode_info.XResolution || y >= mode_info.YResolution) {
    panic("invalid coordinate"); // do we want this check always?
  }

  uint8_t *pixel = video_mem + ...; // how to paint in (X, Y) in 1D buffer?
                                    // remember the Y axis starts at top left
  memcpy(pixel, &color, (mode_info.BitsPerPixel + 7) / 8); // why the +7?
}

void draw_rectangle(...) {
    for (...) draw_pixel(...);
}
```
---

class: center, middle, inverse

### Project

---

### Objectives

- Use the studied I/O devices in a real-life application (+RTC and/or UART)
    - Can you do better than simply copy-paste the code?
    - I expect you to have a readable and maintainable codebase, *including* the Makefile
- Can be a multiplayer game, a collaborative text editor...
    - Computer graphics are not as important as you think
- You might get some ideas from previous editions...

<iframe width="560" height="315" src="https://www.youtube.com/embed/DJt4Tn7C3Q8?si=d_1-iA9sRRAQPcTF" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
---

### Use cases for I/O devices

- **Timer**: for counting the time
    - Establishing a framerate
- **Keyboard**: main app operation
    - Scroll through the menu
    - Move a player, do actions...
    - Write your name (difficult; needs mapping keys to sprites)
- **Mouse**: complementary app operation
    - Making a gesture to trigger an action
    - Implementing a fine-grained UI
- **Graphics card**: draw the app
- **RTC**: storing/showing the date+time
- **UART**: multiplayer/collaborative!

Anything else?

---

### The RTC

- A fairly simple controller
    - Really, by all means find 1 or 2 hours to implement this
    - By the end you'll understand why some OS (Windows vs Linux...) show different dates!
- Maintains the **date and time of day**, even when the PC is switched off
- Has several internal one-byte registers
  - The first 10 (`0x0` to `0x9`) are reserved for time-related functionality
  - The next 4 (`0xA` to `0xD`) are control registers
- Programmable via a 2-port interface
  - Write the internal register number to `0x70`
  - Read/write to `0x71`
- Exposes updates via interrupts, if configured to do so

> Be careful with read/writes during updates. How to avoid inconsistent dates?

---

### The serial port (UART)

- A not so simple endeavour...
    - But necessary for multiplayer and maximum grade
- The UART sends data signals over *one channel*, thus called *serial*
  - The *asynchrony* is due to the fact that the receiver/sender clocks are not synchronized, and *characters* (sort-of packages) are surronded by a *frame* (start and stop bits) and a parity bit for error detection
- Has 1 data R/W internal register (added to a base port offset for direct I/O access) and several control registers, with different functionality
    - Data ready in polled operation
    - Transmission errors
    - Enabling interrupts
- It is costly and **slow** to send data over the UART
  - You must design an efficient multiplayer data schema

> The UART can be emulated between two VBox instances using e.g. named pipes. Check the tutorial on Moodle.
---

### Double buffering

- You will notice screen tearing (or *flickering*) if you update the graphics card memory in real-time
    - Use "double buffering" to avoid this phenomenon: always write to a hidden buffer

```c
static char* buf; // mapped via `vm_map_phys`
static char hidden_buf[BYTES_PER_COLOR * XRES * YRES]; // mind stack overflows...

void draw_pixel(uint32_t color, uint16_t x, uint16_t y) {
    uint32_t idx = ...;
    memcpy(hidden_buf + idx, &color, BYTES_PER_COLOR);
}

void refresh_screen() {
    memcpy(buf, hidden_buf, BYTES_PER_COLOR * XRES * YRES);
}
```

- There is a better way: do it via HW!
    - Allocate 2 times the amount of memory needed and flip the "screen start pointer" each frame
    - Lookup function `SET_DISPLAY_START` in the VBE specification

---

### Event-driven programming

- Make sure to **separate business logic from I/O functionality**
    - Your app does not care about how to read keyboard data, it should only understand that a certain key was pressed and act upon that

```c
// main.c
while (1) {
    receive(&msg);
    if (msg & BIT(timer_bit_no)) {
        timer_ih(); // a basic IH data handler.
        on_time_passed(get_time_counter());
    } else {...}
}
```
```c
// app.c
enum app_state_t {MAIN_MENU, IN_GAME};
enum app_state_t state = MAIN_MENU;

void on_time_passed(uint32_t counter) {
    if (counter % (60/FPS) == 0) { draw(); }
}

void draw() {
    switch (state) {
        case MAIN_MENU: draw_main_menu(); break;
        case IN_GAME: draw_game(); break;
    }
}
```
---

### Object-oriented design in C

- C is not an object-oriented language
    - But you can achieve abstraction and encapsulation nevertheless!

```c
// sprite.c
typedef struct sprite_t {
    int32_t x, y;
    uint16_t width, height;
    char *map;
} sprite_t;

sprite_t* create_sprite(const char *pic[], int32_t x, int32_t y) {
    sprite_t* sp = (sprite_t*) malloc(sizeof sprite_t); // why are we allocating?
    if (sp == NULL) return NULL;
    xpm_image_t img;
    sp->map = (char *) xpm_load(pic, XPM_8_8_8_8, &img);
    ...
    return sp;
}
```
```c
// sprite.h
typedef struct sprite_t sprite_t; // users of sprite.h won't access internals

sprite_t* create_sprite(const char *pic[], int32_t x, int32_t y);
int move_sprite(sprite_t* sprite, int16_t xmov, int16_t ymov);
int draw_sprite(sprite_t* sprite);
int destroy_sprite(sprite_t* sprite);
...
```

---

### Performance considerations

- *Avoid memory allocations!* Dynamic memory is only needed if you do not know the size of an object before hand
    - If you must, e.g. to create a pool of game objects, remember to free them eventually
- Cache computations, and be lazy!
    - You want to draw only at a specific frame rate, not when the user performs an action
    - You do not need to recompute sprites for every frame! Load them at the start
    - Do not branch in hot code! Conditionals are *slow*

> LCOM-specific: define the `__LCOM_OPTIMIZED__` symbol when compiling to remove LCF checks.

---

class: center, middle, inverse

## Good luck!

#### Be creative, and have fun!
