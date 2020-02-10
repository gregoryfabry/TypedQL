"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const resolve = (query, resolverFactory) => __awaiter(void 0, void 0, void 0, function* () {
    const result = query.metadata ? Object.assign({}, query.metadata) : {};
    return Object.assign(Object.assign({}, result), (yield resolveInner(query, resolverFactory(result))));
});
exports.resolve = resolve;
const resolveInner = (query, resolver) => __awaiter(void 0, void 0, void 0, function* () {
    const subqueryMap = query.subqueries.reduce((acc, cur) => {
        return Object.assign(Object.assign({}, acc), { [cur.$key]: cur });
    }, {});
    const partialResult = yield resolver(query);
    const result = {};
    for (let prop in partialResult) {
        if (typeof partialResult[prop] === 'function') {
            if (subqueryMap[prop]) {
                const subquery = subqueryMap[prop];
                const subqueryResult = partialResult[prop](...subquery.args);
                result[prop] = yield mapOverSubqueryResult(subqueryResult, subquery.returnQueries);
            }
        }
        else {
            result[prop] = partialResult[prop];
        }
    }
    return result;
});
const mapOverSubqueryResult = (subqueryResult, returnQueries) => __awaiter(void 0, void 0, void 0, function* () {
    if (subqueryResult instanceof Array) {
        const mappedSubqueryResult = [];
        for (let i = 0; i < subqueryResult.length; i++) {
            mappedSubqueryResult.push(yield mapOverSubqueryResult(subqueryResult[i], returnQueries));
        }
        return mappedSubqueryResult;
    }
    let resolvedResult = Object.assign({}, subqueryResult.metadata);
    const metadataResult = subqueryResult.metadata;
    for (let i = 0; i < returnQueries.length; i++) {
        const returnQuery = returnQueries[i];
        if (returnQuery.metadata) {
            for (let prop in returnQuery.metadata) {
                if (metadataResult[prop] !== returnQuery.metadata[prop]) {
                    continue;
                }
            }
        }
        resolvedResult = Object.assign(Object.assign({}, resolvedResult), (yield resolveInner(returnQuery, subqueryResult)));
    }
    return resolvedResult;
});
