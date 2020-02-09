"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const createResolver = (resolver) => {
    const factory = (metadata) => {
        const resolverFn = resolver(metadata);
        resolverFn.metadata = metadata;
        return resolverFn;
    };
    return factory;
};
exports.createResolver = createResolver;
