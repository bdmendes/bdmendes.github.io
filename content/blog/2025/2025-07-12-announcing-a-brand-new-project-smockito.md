---
title: "Announcing a brand new project: Smockito"
hero: ./mojito.jpeg
---

It's been two and a half years since I've started a new personal project. Since then, I gratuated, started a life on my own, and, to be fair, programming after 8 hours of daily work doing just the same is not as fun as it used to. For better or for worse, watching a sitcom at home with friends or a going out for a casual drink, returning home not past two, is usually a better plan, and one that allows me to clear my mind for the challenges to come the following day.

Nevertheless, *sometimes* there comes a challenge that turns my all-nighter mode on again. This time, instead of a desire to discover the world of chess programming, it was a frustration.

At work we are migrating some of our projects to [Scala 3](https://docs.scala-lang.org/scala3/new-in-scala3.html). The new major version of the language comes with a brand new compiler, much more sound[^dotty] than Scala 2's, but took away a major API that the ecossystem relied upon: the original Scala macros. The new metaprogramming API is forward-compatible, but its existence does mean that complex libraries had to be rewritten from the ground up, leading to serious fragmentation, perhaps worse than the one Python2/3 caused a few years ago.

What has not been rewritten is deceased and must be replaced[^tasty-reader] as part of the upgrade. One of the pain points we found was that `specs2-mock`, the mocking sugar provided by our test framework, was dropped as part of a quest of the author towards [Becoming Reasonable](https://medium.com/@etorreborre_99063/becoming-reasonable-361d7f674ee0)[^becoming-reasonable].

## Why is mocking useful?

Software is usually built as modules, in a layered layout. Say our platform boasts a database of users, with account information and links to activity. In backend code, it probably will look something like this:

```scala
class UsersDatabase(ctx: PostgresContext) extends Database[User]:
    override val table = ctx.getTable("users")
    def getUsers(limit: Int): List[User] = table.get.limit(limit)
    def updatePassword(user: User, password: String): Boolean = 
        table.upsert(user.updated(password = password.hashed))
```

In front of that we'll have a user-facing API that the frontend communicates with, and that requires a database.

```scala
class UsersService(database: Database[User]) extends RestApi:
    val usersRoute = get {
        complete(database.getUsers(limit = 10))
    }
```

We now want to test this integration in our unit tests.

```scala
class UsersServiceSpec extends Specification:
    val mockUsers = List(User("jose"), User("bruno"))

    test("retrieve the first 10 known users"):
        val service = UsersService(???) // how to inject a database?
        assertEquals(service.usersRoute.get().await, mockUsers)
```

It's not free to *mimic* a full database just to test some business logic. We could use the likes of [Embedded Postgres](https://github.com/zonkyio/embedded-postgres), but that would make tests severely slower. In theory, we just need to summon a class that acts *like* a database, and returns some fake response.

That is exactly what interfaces are for. In Scala, we could implement our own `Database` trait that *selects*, *filters*, *deletes* and so on. But that is tedious and error prone. What about just implementing the needed functionality from a `UsersDatabase`, here `getUsers` and `updatePassword`? That would be nice, but our `UsersDatabase` is not an interface; instead, it is a *side-effectful* class in the way that at initialization time it queries some table from a real context.

The most obvious remedy is to decouple what a `UsersDatabase` needs to be able to do from how it does it, by introducing a new trait:

```scala
trait UsersDatabaseApi:
    def getUsers(limit: Int): List[User]
    def updatePassword(user: User, password: String): Boolean

class UsersDatabase(ctx: PostgresContext) extends Database[User] with UsersDatabaseApi:
    override val table = ctx.getTable("users")
    override def getUsers(limit: Int): List[User] = table.get.limit(limit)
    override def updatePassword(user: User, password: String): Boolean = 
        table.upsert(user.updated(password = password.hashed))
```

And then, at the service level, require the interface instead of the implementation.

```scala
class UsersService(database: UsersDatabaseApi) extends RestApi:
    val usersRoute = get {
        complete(database.getUsers(limit = 10))
    }
```

We've just applied the [Dependency Inversion Principle](https://en.wikipedia.org/wiki/Dependency_inversion_principle). However, as with most rules and principles, they should not be followed blindly. In this case, we could argue that we are just duplicating code where in reality (production code) we will just have one implementation. Isn't that boilerplate?[^boilerplate]

A mocking framework solves just this problem.

## The status quo of mocking in Scala

![mockito](./mojito.jpeg)
*Mockito is not an alcoholic beverage.*

Using [Mockito](https://github.com/mockito/mockito), the most popular mocking framework for Java[^java-interop], one would do:

```scala
class UsersServiceSpec extends Specification:
    val mockUsers = List(User("jose"), User("bruno"))

    def setUpMockDatabase(): Database[User] =
        val database = Mockito.mock(classOf[Database[User]])
        Mockito
            .when(database.getUsers(ArgumentMatchers.any[Int]))
            .thenReturn(mockUsers)
        database

    test("retrieve the first 10 known users"):
        val service = UsersService(setUpMockDatabase())
        assertEquals(usersRoute.get().await, mockUsers)
```

All good. However, we can very easily do nasty things with the Mockito API:

```scala
def setUpMockDatabase(): Database[User] =
    val database = Mockito.mock(classOf[Database[User]])
    Mockito
        .when(database.getUsers(ArgumentMatchers.any[String]))
        .thenAnswer(_ => "a chess board")
    database
```

This will blow up at runtime, for sure, but being able to compile should raise up some red flags. This example is obviously made up, but more subtle bugs surface in very large codebases when the tooling is not rigid enough.

Let's try a different framework. [Scalamock](https://scalamock.org/) has a very cute logo and website and is a native Scala solution, with good type checking semantics.

```scala
def setUpMockDatabase(): Database[User] =
    val database = stub[Database[User]]
    database.getUsers.returnsWith(mockUsers)
    database
```

Much more readable! But, unfortunately, this blows up at runtime with a `NullPointerException`. What? Yeah. Well, from the Scalamock docs...

> What is not mockable?
> - val and lazy val - can’t be mocked, if they have no implementations - they are assigned to null

Which is followed by a fat rule:

> Instead, your components must depend on interfaces (traits), not implementations, so you can easily stub/mock them.

Well, then, I'd argue there is no point in having a mocking framework. If I have to introduce interfaces, I might as well instantiate them myself in tests.

## Enter Smockito

Smockito is an effort of mine inspired by the Scalamock Stubs API, and provides a simple, type-safe way to set up stubs and reason about its interactions, but does so using a Mockito backend. This way, we can mock pretty much any type, with an expressive syntax:

```scala
val database = mock[Database[User]].on(it.getUsers)(_ => mockUsers)
```

And afterwards quickly inspect interactions with the stub:

```scala
assertEquals(database.calls(it.getUsers), List(10, 10))
assertEquals(database.times(it.getUsers), 2)
```

Behind the scenes, we are desugaring into Mockito API calls, using the likes of `ArgumentMatcher` and `ArgumentCaptor`, and leveraging type checking through inlining, a powerful Scala 3 feature.

Smockito also makes an effort to guide users into solutions upon common problems, such as reasoning over the wrong stub:

```scala
val database = mock[Database[User]].on(it.getUsers)(_ => mockUsers)
val service = UsersService(database)
val _ = service.usersRoute.get()
assertEquals(database.times(it.updatePassword), 1)
    // throws UnstubbedMethod: ...did you forget to stub this?
```

[Smockito](https://github.com/bdmendes/smockito) is fully open-source and is published in Maven Central. I now hope that it will be of use to Scala developers and am open to any contributions.

[^dotty]: What I mean by that is that the type system is now built upon stronger theorethical foundations, which allowed for shiny new features that boost productivity and make code much more readable.
[^tasty-reader]: Mostly. If the Scala 2 code does not use macros, it is fine to use in a Scala 3 project. If it does but the user project does not exercise them, it's also fine. Unfortunately, many useful libraries are built on top of macros.
[^becoming-reasonable]: Though a bit cynical here, I'm all for building focused libraries that do one job and do it well. Turns out that being principled is also painful when people depend on your versatility.
[^boilerplate]: I'm not saying I consider the mentioned refactor bad or too repetitive, but try to generalize the thought.
[^java-interop]: One of the defining features of Scala is full interoperability with Java, which is both amazing and dangerous - amazing because it comes with a great ecossystem for free and dangerous because it injects into the language a style whose safety and expressiveness is [frankly subpar](https://hackernoon.com/null-the-billion-dollar-mistake-8t5z32d6).
