"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const resolve = (query, resolverFactory) => {
    const result = query.metadata ? Object.assign({}, query.metadata) : {};
    return Object.assign(Object.assign({}, result), resolveInner(query, resolverFactory(result)));
};
exports.resolve = resolve;
const resolveInner = (query, resolver) => {
    const subqueryMap = query.subqueries.reduce((acc, cur) => {
        return Object.assign(Object.assign({}, acc), { [cur.$key]: cur });
    }, {});
    const partialResult = resolver(query);
    const result = {};
    for (let prop in partialResult) {
        if (typeof partialResult[prop] === 'function') {
            if (subqueryMap[prop]) {
                const subquery = subqueryMap[prop];
                const subqueryResult = partialResult[prop](...subquery.args);
                result[prop] = mapOverSubqueryResult(subqueryResult, subquery.returnQueries);
            }
        }
        else {
            result[prop] = partialResult[prop];
        }
    }
    return result;
};
const mapOverSubqueryResult = (subqueryResult, returnQueries) => {
    if (subqueryResult instanceof Array) {
        return subqueryResult.map(sqr => mapOverSubqueryResult(sqr, returnQueries));
    }
    let resolvedResult = Object.assign({}, subqueryResult.metadata);
    const metadataResult = subqueryResult.metadata;
    returnQueries.forEach(returnQuery => {
        if (returnQuery.metadata) {
            for (let prop in returnQuery.metadata) {
                if (metadataResult[prop] !== returnQuery.metadata[prop]) {
                    return;
                }
            }
        }
        resolvedResult = Object.assign(Object.assign({}, resolvedResult), resolveInner(returnQuery, subqueryResult));
    });
    return resolvedResult;
};
