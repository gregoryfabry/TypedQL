import { CreateResolver, ResolverInput, ResolverFn } from "./types/Resolvers";
import { Metadata } from "./types/NodeUtilities";

const createResolver: CreateResolver = <Node>(resolver: ResolverInput<Node>) => {
  const factory = (metadata: Metadata<Node>) => {
    const resolverFn: ResolverFn<Node> & { metadata: Metadata<Node> } = resolver(metadata) as ResolverFn<Node> & { metadata: Metadata<Node> };
    resolverFn.metadata = metadata;

    return resolverFn;
  }

  return factory;
}

export { createResolver };