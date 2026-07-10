---
title: Just what is a monad?
hero: ./monad-wall.jpg
---

You might have heard that *monads are just monoids in the category of endofunctors*[^internet-anecdote], and though this sounds scary it is very likely that you already use monads everyday in your programming job without realizing it. Let's try to unpack the sentence digging through some category theory, and seeing how it plays out in Scala.

### Category theory

[Category theory](https://en.wikipedia.org/wiki/Category_theory) is a branch of discrete mathematics[^discrete-math]. It defines[^definition-span] a *category* as an umbrella for all objects that belong to it, and a *morphism* as some way to relate an object to another.

A morphism between two categories *𝒞₁* and *𝒞₂* is called a *functor*. It maps objects of *𝒞₁*, and its morphisms, into objects of *𝒞₂*, and its morphisms.

#### In (functional) programming

Let's use a product type[^product-type] as the first category. Our `User` type is a composition of a `String` and an `Int`, which are also categories.

```scala
case class User(name: String, age: Int)
```

Using the aforementioned terminology, `joseph` and `fernando` are objects of the `User` category, or instances of the `User` type.

```scala
val joseph = User("Joseph", 25)
val fernando = User("Fernando", 16)
```

A way to go from `User` to `Boolean` in a way that signifies whether a user is an adult or not is a morphism, which we can implement as a method in `User`.

```scala
case class User(name: String, age: Int):
  def isAdult: Boolean = age >= 18
```

A functor that maps a category to itself is called an *endofunctor*. For example, a method that hashes the name of the user is an endofunctor, since it maps the `User` category to itself.

```scala
case class User(name: String, age: Int):
  def hashed: User = User(name.hashCode.toString, age)
```

### A Monoid in the wild

There are certain problems in programming that tend to repeat over several domains and instances. Say we want to read a file in batches: worker 1 reads the first 100 lines, worker 2 the next 100, and so on. At the end, we can join all the strings together.[^scala-not-ideal]

```scala
def read(offset: Int, bytes: Int): String = ???
val strs = (0 until 1000 by 100).map(offset => read(offset, 100)).toList
val concatenation = strs.foldLeft("")((s1, s2) => s1.appended(s2))
```

Had we have read a bunch of numbers instead, we could do:

```scala
val numbers: List[Int] = ???
val sum = numbers.foldLeft(0)((n1, n2) => n1 + n2)
```

Can we implement a generic `combine` method that works for all types?

```scala
def combine[A](xs: List[A], f: (A, A) => A, zero: A): A =
  xs.foldLeft(zero)(f)
```

The answer is yes, passing in functions that provide how to start the resulting accumulation and how to combine two elements. The two cases above would then be expressed in terms of `combine`:

```scala
val concatenation = combine(strs, (s1, s2) => s1.appended(s2), "")
val sum = combine(numbers, (n1, n2) => n1 + n2, 0)
```

This is an improvement, but we still have to repeat the lambda for each call site; in principle, the way to combine two `String` or `Int` together won't ever change.

#### An OOP attempt

An object-oriented mind might be ticking: we could make `String` and `Int` implement some `Combinable` interface...

```scala
trait Combinable:
  def combine(that: Combinable): Combinable
  def empty: Combinable

class MyInteger extends Integer with Combinable // what now?
```

But there is no way to specify, at the interface level, that `combine` should only be called with the same type; i.e. what will implement `Combinable`. Also, `String` and `Int` are types we do not control, and it is not viable to change their implementation.

#### The typeclass approach

A typeclass in Scala[^typeclass-scala] is some operation defined over a type `A`, provided *a posteriori* and for each concrete type that needs it.

```scala
trait Combiner[A]:
  def combine(a1: A, a2: A): A
  def empty: A
```

Notice that this is not a behavior that will be mixed in a particular instance; rather, it is an operator that knows how to combine two instances of a type `A`. We can then implement `Combiner` for `String` and `Int`:

```scala
given Combiner[String]:
  def combine(s1: String, s2: String): String = s1.appended(s2)
  def empty: String = ""

given Combiner[Int]:
  def combine(n1: Int, n2: Int): Int = n1 + n2
  def empty: Int = 0
```

Via the `given` keyword, these instances are available to those who require them via the `using` keyword. Let's reimplement `combine` using the typeclass:

```scala
def combine[A](xs: List[A])(using c: Combiner[A]): A =
  xs.foldLeft(c.empty)(c.combine)
```

Since the typeclass is required via `using`, call sites do not need to pass it explicitly, and the compiler will find the right instance for the type `A` in scope.

```scala
val concatenation = combine(strs)
```

For any new type that can be combined, we do not need to change its implementation, nor the `combine` body. The only thing we need to do is provide a new instance of `Combiner` for that type.

I have been calling it `Combiner`, but functional programmers and mathematicians call it a *monoid*. A monoid is a type `A` (or a refinement to it) that has an associative binary operation and an identity element. In our case, the binary operation is `combine`, and the identity element is `empty`.

### A Monad in the wild

Say we have a database of `User` with a `getUser` method that allows retrieving a user by its identifier, provided it may not exist.

```scala
def getUser(id: String): Option[User] = ???
```

In Scala, an `Option`[^option-monad] is roughly defined as the following [algebraic data type](https://en.wikipedia.org/wiki/Algebraic_data_type):

```scala
enum Option[+A]:
  case Some(value: A) extends Option[A]
  case None extends Option[Nothing]
```

So we could get a result like `None` or `Some(fernando)`. Depending on the result, we might want to end the computation early, or process it somehow:

```scala
def printUserIfExists(id: String): Unit =
  getUser(id) match
    case Some(user) => println(s"User: ${user.name}, age: ${user.age}")
    case None => ()
```

And also maybe retrieve all users with the same age group...

```scala
def printUsersWithSameAgeGroup(id: String): Unit =
  getUser(id) match
    case Some(user) =>
      getUsersByAgeGroup(user.age) match
        case Some(users) =>
          users.foreach(u => println(s"User: ${u.name}, age: ${u.age}"))
        case None => ()
    case None => ()
```

We see where this is going. The error handling is getting out of hand; once the business logic gets complicated, the *happy path* will be so nested and cryptic that this will be a nightmare to maintain.[^throwing]

For a computation that depends on result of the previous one, for whose absence, or failure, we know to proceed, we can use the monadic operations in `Option`.

```scala
def printUsersWithSameAgeGroup(id: String): Unit =
  getUser(id).flatMap: user =>
    getUsersByAgeGroup(user.age).map: users =>
      users.foreach(u => println(s"User: ${u.name}, age: ${u.age}"))
```

Notice that `flatMap` operates on a `Option[User]` and takes a `User => Option[Unit]`, that is, how to proceed if the user is found, taking another computation that may also fail. In turn, `map` operates on a `Option[List[User]]` and takes a `List[User] => Unit`, that is, how to proceed if the list of users is found, now without any possibility of failing[^fail-possibility].

![](./monad-wall.jpg)
*It seems that a *monad* in philosophy refers to some kind of basic, universal substance that is the basis of all matter.*

The absence of some value is just one of many things we can do with a monad[^extension-note]:

```scala
trait Monad[F[_]]:
  def pure[A](a: A): F[A]
  def flatMap[A, B](fa: F[A])(f: A => F[B]): F[B]
```

Think of it as an operation defined for boxes over `A`, like `Option[A]`. That box may signify asynchrony, failure, logging, or any other effect. The `pure` method puts a value in the box, and `flatMap` allows us to chain computations that may also return a box, focusing on the happy path. `map` can be expressed in terms of `flatMap` and `pure`:

```scala
  final def map[A, B](fa: F[A])(f: A => B): F[B] =
    flatMap(fa)(a => pure(f(a)))
```

For `Option`, we could write:

```scala
given Monad[Option] with
  def pure[A](a: A): Option[A] = Some(a)
  def flatMap[A, B](fa: Option[A])(f: A => Option[B]): Option[B] =
    fa match
      case Some(a) => f(a)
      case None => None
```

The early, cascading return of a monad is everywhere in other languages: `?` in Rust, null safety in Kotlin, `Maybe` in Haskell, and so on.

### Monoids vs Monads

Looking at the interface signatures above, you may have noticed that a monad is not even a monoid. They serve different purposes; a monad for `A` does not know how to combine two `A`. It knows instead how to combine two instances of itself: `F[A] => F[B]`. Since two `F` are technically the same (higher kinded) type, then it is an endofunctor. And that's what the famous sentence is telling – at a higher level, a monad over `A` is a monoid over `F[A]`.

Thinking in types, and its high order relationships, requires practice. The [Red Book](https://www.amazon.com/-/en/Functional-Programming-Second-Michael-Pilquist/dp/1617299588) provides a lot of insight on how to think functionally and builds its way from simple functional programming principles up to generalizations like this at a pace. If you found the article interesting, even if too fast, have a look at it. The ultimate goal is to be able to reason about code in a principled way, making solutions to common problems come naturally and concisely.

Also, make sure to grab a kebab in Berlin sometime.

[^internet-anecdote]: An [internet anecdote](https://james-iry.blogspot.com/2009/05/brief-incomplete-and-mostly-wrong.html).

[^discrete-math]: A branch of mathematics concerned with studying sets of enumerable objects instead of continuous ones. For instance, a graph representing a city map's points is discrete; the real numbers are not.

[^definition-span]: In rather simplistic terms, for the sake of clarity and having in mind I am not a mathematician.

[^product-type]: A compound type, i.e. a typed list of other types. Sometimes referred to as a tuple.

[^scala-not-ideal]: Some of the code presented here is intentionally not the most concise it could be, for the sake of the argument and clarity.

[^fail-possibility]: Of course, `println` may fail, since it's I/O, but we are concerned here with what may fail and is easily encodable in the type system. I/O is an effect and effect libraries would indeed also track this via a Monad – see [cats-effect](https://typelevel.org/cats-effect/) for an example of a library that does this.

[^extension-note]: Notice that this external operator over an higher kinded type takes two operands, as in `monad.flatMap(opt1)(opt2)`. In practice, to allow for `opt1.flatMap(opt2)`, we should have the monad provide an extension method over the type it is defined for.

[^typeclass-scala]: Truth be told, Scala has no native typeclass construct, as Haskell `class` does. However, it is possible to replicate typeclasses in Scala via the `given` and `using` keywords, which allow for implicit resolution of instances of a typeclass for a given type.

[^option-monad]: Our monad in the wild. The Scala standard library implements functional operators in an *ad hoc* fashion, without extending any specific abstraction like the ones in [cats](https://typelevel.org/cats/). However, at the language level the `map` and `flatMap` methods do have special treatment, allowing for the use of the `for` comprehension syntax.

[^throwing]: Why not simply throw an exception and go along the happy path? One of the basis of functional programming is that functions should not lie in their signature: if they claim they return `User`, they should do so and not be able to silenty fail or perform unrelated effects. It is hard, and cumbersome, to track and catch possible exceptions in call sites.
