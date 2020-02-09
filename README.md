# TypedQL

TypedQL is a graph query builder and resolver library written in TypeScript. With TypedQL, you can:

#### Define a graph API using TypeScript types:

```
interface Queries {
  featuredAuthors: (year: number) => Author[];
}
```

```
interface Author {
  firstName: string;
  lastName: string;
  
  topBooks: (limit: number) => Book[];
}
```

```
interface Book {
  title: string;

  author: () => Author;
}
```

#### Write static queries against a graph API:

```
const query = buildQuery<Queries>({})(queries => [
  queries('featuredAuthors', 2020)(author => [
    author('topBooks', 5)
  ])
]);
```

This query gets featured authors for the year 2020. For each author, it gets the top five books. Everything is fully typed - which means that you can explore your entire API in your IDE from a single import.

#### Serialize queries as JSON and correctly type the result:

```
  const response = await fetch('/api', { method: 'POST', body: JSON.stringify(query) });
  
  const result = response.json() as Result<typeof query>;
```

#### Implement resolvers for a graph API:
```
const queryResolver: Resolver<Query> = createResolver(metadata => query => ({
  ...metadata,
  featuredAuthors: year => getFeaturedAuthors(year).map(author => authorResolver(author))
}))
```

#### And finally, resolve queries:
```
  const result = resolve(query, queryResolver);
```

## Getting Started

### Library status

This is a **proof of concept** and not intended to be used in production systems.

### Prerequisites

TypeScript >= 3.7.4

### Installing
```
npm i -s TypedQL
```

## Usage

### Recommended usage

TypedQL builds queries against an API defined using only TypeScript types. With that feature in mind, TypedQL was built to accommodate the following workflow:

1. API types are defined in a way such that they can be imported by both client and server code.
2. The server uses `createResolver` to create a `Resolver<Type>` for each type in the API.
3. The client uses the `queryBuilder` to construct a serializable query against the API.
4. The client serializes the query and sends it as a request to the server.
5. The server deserializes the query and `resolve`s it with the corresponding resolver.
6. The server serializes the result and sends it as the response to the client.
7. The client deserializes the response and uses the utility type `Result<Q extends Query<any, any>>` to correctly set the type of the result.

### Defining the API

A TypedQL graph API consists of a set of types. Each type contains properties that are either metadata or links.

```
interface Author {
  // metadata
  firstName: string;
  lastName: string;
  
  // links
  topBooks: (limit: number) => Book[];
}
```

**Metadata** are properties that are primitives and not functions. They are the properties on a type that are always defined.

**Links** are properties that are functions. They may take some parameters and must return another graph type or list of that graph type. They are the properties on a type that may resolve to the return type of the function, if queried.

Graph API types should observe the following rules:
* Metadata should only be primitives, not another graph type.
* Links should return a graph type or an array of a graph type.
* Links that take parameters of a graph type `T` should define those parameters as `Metadata<T>`. e.g.
```
  interface Queries {
    // incorrect: parameters are of type Author and Book, which contain links
    addBookToAuthor: (author: Author, book: Book) => Error | Success;

    // correct: parameters are of type Metadata<Author> and Metadata<Book>
    addBookToAuthor: (author: Metadata<Author>, book: Metadata<Book>) => Error | Success
  }
```

### Implementing the API using `createResolver`

Each type needs a `Resolver<Type>` corresponding to it. Use `createResolver` to implement a resolver.

**`createResolver<Type>`**
```
((metadata: Metadata<Type>) => (query: Query<Type>) => ResolverResult<Type>) => Resolver<Type>
```

`createResolver` takes a curried function that take the metadata for that type and the query being resolved on that type, and return an object of that type.

Each *link* in the returned object will be invoked by the resolver if there is a subquery for that link. Each link must return a `PartiallyAppliedResolver<ReturnType>`, where `ReturnType` is the return type of that link. 

For example, given the following API:

```
inteface A {
  a1: string;
  a2: string;

  b: () => B;
}
```
```
interface B {
  b1: string;
  b2: string;
}
```

A resolver for `A` might look like this:

```
const AResolver: Resolver<A> = createResolver(metadata => query => ({
  ...metadata,
  b: () => BResolver({ b1: 'foo', b2: 'bar' })
}))
```

Note how the link `b` on `A` returns `B`, but the type returned in the resolver is a `PartiallyAppliedResolver<B>`, obtained by invoking the resolver with the desired metadata.

If a link returns an array, then each element of that array must be a `PartiallyAppliedResolver`, or another array of `PartiallyAppliedResolver`.

### Writing queries for the API using `buildQuery`

**buildQuery** takes a type parameter of a graph API type and a parameter of the metadata for that graph type. If there is no metadata, empty object should be passed. It returns a `QueryBuilder`, which allows you to explore the graph API using callbacks.

From the example above,
```
const query = buildQuery<Queries>({})(queries => [
  queries('featuredAuthors', 2020)(author => [
    author('topBooks', 5)
  ])
]);
```

We can see the first `QueryBuilder` returned from `buildQuery`. It's a `QueryBuilder` for `Queries`, because that's the type parameter passed into `buildQuery`. We pass in a callback that takes one parameter: the `SubqueryBuilder`. We return an array of all the links we request using the `SubqueryBuilder`.

We can also see that each `SubqueryBuilder` returns a `QueryBuilder` for the return type of the link, which allows us to extend the request. The `featuredAuthors` query returns an `Author`, so we can use the `QueryBuilder` of `Author` to add additional subqueries on what is returned.

The type system is complex to understand but easy to intuit. Rather than try to decipher what's going on in the first pass, try experimenting with the query builder to see how queries can be built. Any modern IDE will provide sufficient type inference and autocomplete.

`buildQuery` returns, appropriately, a `Query`. That can be serialized and sent elsewhere, and also used to infer the return type of the resolved query:

```
const result = response.json() as Result<typeof Query>; // Check result.featuredAuthors
```

This is useful when serializing queries and resolving them elsewhere.

#### Note on returning multiple types

The following is a valid graph API:
```
interface Q {
  ab: () => A | B;
}

interface A {
  type: 'A';
  sq: (a: string) => A;
}

interface B {
  type: 'B';
  sq: (b: number) => B;
}
```

Suppose we write a query:
```
const query = buildQuery<Q>({})(q => [
  q('ab')(aOrB => [
    aOrB('sq', ) // error: which link are we invoking?
  ])
])
```

To fix this issue, you can specify which return type the query is valid for using the `match` parameter.

```
const query = buildQuery<Q>({})(q => [
  q('ab')({ type: 'A' }, a => [
    a('sq', 'foo') // subquery if return type matches { type: 'A' }
  ])({ type: 'B' }, b => [
    b('sq', 5) // subquery if return type matches { type: 'B' }
  ])
])
```

The `match` parameter takes a subset of the properties of all types returned by that link. If all properties match, the subquery is execute. This also sets the types correctly: in the result of the query above, `ab` will either be an `A` with a subquery on `sq` or `B` with a subquery on `sq`.

### Resolving queries

Resolving queries is simple and done with `resolve`:

```
<Type>(query: Query<Type>, resolver: Resolver<Type>) => Result<Type>;
```

Note that the caller of this function *must* ensure that the query type and resolver type matches. `resolve` won't figure out if the type of the query and the type of the result is a mismatch, and is undefined behavior.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
