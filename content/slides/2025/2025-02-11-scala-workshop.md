---
title: "Rethinking programming: an introduction to functional programming with Scala"
description: Support material for my Scala workshop given in ENEI 2025 @ FEUP/ISEP.
tags: ['workshop', 'feup']
---

class: center, middle, inverse, small-images

# Rethinking programming

### A gentle introduction to functional programming with Scala

#### ENEI 2025 @ FEUP/ISEP

---

class: center, middle, inverse

### Your host

<img src="/assets/about-me/bdmendes-2022.jpg" style="width: 15%; border-radius: 5em;">

** Bruno Mendes **

Software Engineer @ Kevel  
Invited Lecturer @ FEUP  
FEUP Alumnus (graduated in 2024)  
Worked professionally with C++, Kotlin and Scala  

---

class: center, middle, inverse

### Kind reviewer

<img src="/assets/slides/enei-25-scala/joao-azevedo-linkedin.jpeg" style="width: 15%; border-radius: 5em;">

** João Azevedo **

Principal Engineer @ Kevel  
FEUP Alumnus  

---

### What you'll need

- Foundational knowledge of object-oriented programming
  - Java, C++, C# is fine
- Computer science concepts
  - Lexical scopes, loops, variables, functions
  - Recursion (more specifically, search algorithms)
- A computer with an IDE
  - VS Code or IntelliJ are recommended
  
> If any of these concepts is unfamiliar to you, feel free to interrupt me.

---

class: center, middle, inverse

### Functional programming concepts

#### What's functional programming? Don't most languages have functions already?

---

### Function composition

- Functional programming is a programming paradigm where programs are a *composition of pure functions*
  - Read pure functions as their mathematical counterpart, i.e. *objects* that map inputs to transformed values and have **no side-effects**
  - Functions are **first-class citizens** and may be used as arguments or return values, as any other type

```scala
def transformed(numbers: List[Int], op: Int => Int): List[Int] = { 
    numbers.map(op).toList // How is this implemented?
}

val numbers = List(1, 2, 3)

val doubledNumbers = transformed(numbers, n => n*2)
```

> Think of side-effects as something that mutates the external state of a system. For instance, reading from the console (or any kind of I/O).

---

### Referential transparency

- Pure functions are **predictable** in that they don't change inputs and behave the same given the same input
  - Hence you can replace any subexpression by its value and get the same result
  - This property helps compilers reason about the program more easily and perform optimizations (e.g., *common subexpression elimination*)

```scala 
// This version may throw instead of returning.
// We cannot safely compose this computation.
def opaqueDivide(a: Int, b: Int): Int = {
    if (b == 0) throw new IllegalArgumentException("division by 0") else a / b
}

// Here, we use the `Option` type to clearly state that this function may fail. 
def transparentDivide(a: Int, b: Int): Option[Int] = {
    if (b == 0) None else Some(a / b)
}
```

> `Option` is a monad encapsulating the absence of a value. Monads wrap a value with context, allowing more concise operation chaining. Here e.g. `val result = divide(10, 2).flatMap(x => divide(x, 2))` would avoid pattern matching. Monads have well-defined mathematical properties.
---

### Evaluation strategies

- Function arguments may be evaluated *eagerly* or *lazily*, depending on the desired semantics
  - Lazy evaluation might help you avoid unneeded computations

```scala
case class User(name: String, age: Int)
case class OrderPlaced(description: String)

def validUser(user: User): Boolean = user.age >= 18

def sellWine(user: User, onWineSold: => String): Option[OrderPlaced] = {
    if (validUser(user)) {
        Some(OrderPlaced(onWineSold)) // 'onWineSold' is evaluated lazily
    } else {
        None
    }
}
```

---

### Orthogonal advantages

- Modularity out-of-the-box
  - State is encapsulated by nature and dependencies are explicit
  - Enables test-driven development!
- Maintainability
  - Easier to read and to reason about
- Thread-safety
  - No state is shared, so go ahead and launch computations in several cores!

---

class: center, middle, inverse

### Here comes Scala

#### The hybrid object-functional language

---

### Scala

- A flexible, object-functional programming language in the JVM
  - Allows you to make use of the entire ecosystem in a much more functional way
  - Is not rigid, in that it allows to introduce mutable state *when needed*
  - Leverages a very powerful and expressive type-system with OOP support
  
> We'll focus in Scala 3; however, all concepts apply to Scala 2, although possibly with different syntax.

---

### Expressions

```scala
// A value is immutable.
val numbers = List(1, 2, 3)

// A variable is mutable.
var count = 0
count = count + 1

// A function is a first-class citizen.
val odds = (numbers: List[Int]) => numbers.filter(n => n % 2 != 0).toList

// Methods are evaluated every time they are called.
def calculator = {
    println("Calculating.")
    odds
}

// A value can also be lazily evaluated, but only once.
lazy val numbersDescription = s"Odd numbers are ${calculator(numbers)}"
```

> The best expression type to use depends on the use case.

---

### Classes

```scala
// You may import qualifications as in Java.
import java.util.concurrent.atomic._

// As in Java, you can create a regular class, with some syntax sugar.
class NumberProcessor(val numbers: List[Int]) {
    var requests = new AtomicInteger(0)
    def double = {
        requests.incrementAndGet()
        numbers.map(_ * 2).toList
    }
    def requested = requests.get()
}

// And have static symbols under its namespace.
object NumberProcessor {
    def fromOdds(until: Int): NumberProcessor = {
        val odds = (0 to until).filter(_ % 2 != 0).toList
        new NumberProcessor(odds)
    }
}
```

---

### Case classes and pattern matching

```scala
// A trait is analogous to a Java interface, but with allowed implementations.
// Making it sealed means that it may only be extends in "this" file.
sealed trait Person 

// To adhere to the functional schema, your classes should be immutable.
// A `case class` leverages just that meaning.
case class User(name: String, cookie: Option[String]) extends Person
case class Admin(id: String) extends Person

// And enables pattern matching.
def id(person: Person): String = {
    person match {
        case User(name, _) => s"user-${name}"
        case Admin(id) => id
    }
}

// And may be instantiated without the `new` keyword.
println(id(Admin("big-boss")))
```

---

### Contextual parameters ("implicits")

```scala
case class User(age: Int)

// A parameterized type let's you add behavior without subtyping,
// or provide ad-hoc polymorphism. It's informally called a "type class".
trait Comparator[A] {
    def compare(x: A, y: A): Int
}

// It may become cumbersome to pass configurations/implementations around.
// Contextual parameters help capture a value in-scope.
given userComparator: Comparator[User] with {
    def compare(x: User, y: User): Int = Integer.compare(x.age, y.age)
}

// Notice the multiple parameter lists ("currying"), needed for contextuals.
// `sorted` is defined as Iterable[A] => Comparator[A] => List[A].
def sorted[A](items: Iterable[A])(using comparator: Comparator[A]): List[A] =
  items.toList.sortWith((x, y) => comparator.compare(x, y) < 0)

// No need to pass the comparator around.
println(sorted(List(User(18), User(16))))
```

---

### Immutable collections

```scala
// In functional programming a data structure should also be immutable.
// This is done efficiently by intelligently reusing memory allocations.

def occurences[A](numbers: List[A]): Map[A, Int] = {
  // Notice the private nested looping method.
  def occurencesInner(list: List[A], acc: Map[A, Int]): Map[A, Int] = {
    list match {
      case Nil => acc
      case x :: xs =>
        occurencesInner(
          xs,
          // The last parameter list of the `updatedWith` method in Map
          // has a single "remapping function" Option[V] => Option[V].
          acc.updatedWith(x) {
            case Some(count) => Some(count + 1)
            case None        => Some(1)
          }
        )
    }
  }
  occurencesInner(numbers, Map.empty[A, Int])
}

println(occurences(List(1, 2, 2, 2)))

```

> Could you implement this with a `fold`?

---

### Further concepts

For you to dig into at home...

- Asynchronous computations with `Future`

```scala
def fetchUsers: Future[List] = Http.get(...)
```
- Abstract type members and type bounds

```scala
trait Buffer {
    type T
    val element: T
}

abstract class SeqBuffer extends Buffer {
    type U
    type T <: Seq[U]
    def length = element.length
}
```

- Variance

```scala
class List[+A] // A covariant class
class Printer[-A] // A contravariant class
class Comparator[A] // An invariant class
```

---

### A community effort

- Originally created in academia, Scala has evolved into a mature language widely used in industry
  - *Twitter*, *LinkedIn*, *Netflix*, *Lichess* use Scala to power their backends  

- The native ecosystem is rich
  - [Cats](https://typelevel.org/cats/) – Pure functional abstractions  
  - [Pekko](https://pekko.apache.org/) – Actor-based concurrency (formerly Akka)  
  - [Apache Spark](https://spark.apache.org/) – Distributed computing  
  - [Play Framework](https://www.playframework.com/) – Full-stack web framework  
  - [Slick](https://scala-slick.org/) – Functional relational mapping  

Scala’s ecosystem enables scalable, type-safe, and functional development across diverse domains like **finance, big data, AI and cloud services**.  

---

class: center, middle, inverse

### Let's get to work!

#### Practical exercise

---

