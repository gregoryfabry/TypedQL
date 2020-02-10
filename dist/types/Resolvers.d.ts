import { Metadata } from "./NodeUtilities";
import { Query } from "./Query";
export declare type ApplyResolvers<N> = N extends any ? {
    0: N extends (infer L)[] ? ApplyResolvers<L>[] : never;
    1: PartiallyAppliedResolver<N>;
}[N extends any[] ? 0 : 1] : never;
export declare type ResolverInput<Node> = (metadata: Metadata<Node>) => ResolverFn<Node>;
export declare type Resolver<Node> = (metadata: Metadata<Node>) => PartiallyAppliedResolver<Node>;
export declare type PartiallyAppliedResolver<Node> = ResolverFn<Node> & {
    metadata: Metadata<Node>;
};
export declare type ResolverFn<Node> = (query: Query<Node, any>) => ResolverResult<Node> | Promise<ResolverResult<Node>>;
export declare type ResolverResult<Node> = {
    [Key in keyof Node]: Node[Key] extends (...args: any[]) => any ? (...args: Parameters<Node[Key]>) => ApplyResolvers<ReturnType<Node[Key]>> : Node[Key];
};
export declare type CreateResolver = <Node>(resolver: ResolverInput<Node>) => Resolver<Node>;
