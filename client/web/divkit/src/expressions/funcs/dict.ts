import { toBigInt } from '../bigint';
import { ARRAY, BOOLEAN, COLOR, DICT, INTEGER, NUMBER, STRING, URL } from '../const';
import { ArrayValue, BooleanValue, DictValue, EvalContext, EvalTypes, EvalValue, IntegerValue, NumberValue, StringValue } from '../eval';
import { checkIntegerOverflow, transformColorValue } from '../utils';
import { registerFunc } from './funcs';

function getProp(obj: object, path: string[]): unknown {
    let current: object = obj;

    for (let i = 0; i < path.length; ++i) {
        if (!current) {
            throw new Error(`Missing property "${path[i]}" in the dict.`);
        }
        const val = current[path[i] as keyof typeof current];
        if (val === undefined) {
            throw new Error(`Missing property "${path[i]}" in the dict.`);
        }
        current = val;
    }

    return current;
}

function dictGetter(jsType: string, runtimeType: string) {
    return (ctx: EvalContext, dict: DictValue, ...path: StringValue[]): EvalValue => {
        let val = getProp(dict.value, path.map(it => it.value));

        let type: string = typeof val;
        if (
            jsType === 'array' && !Array.isArray(val) ||
            jsType !== 'array' && type !== jsType ||
            type === 'object' && val === null
        ) {
            if (type === 'object') {
                if (Array.isArray(val)) {
                    type = 'array';
                } else if (val === null) {
                    type = 'null';
                } else {
                    type = 'dict';
                }
            }
            throw new Error(`Incorrect value type: expected "${runtimeType}", got "${type}".`);
        }
        if (jsType === 'number' && runtimeType === 'integer') {
            checkIntegerOverflow(ctx, val as number);
            try {
                val = toBigInt(val as number);
            } catch (_err) {
                throw new Error('Cannot convert value to integer.');
            }
        }
        if (jsType === 'string' && runtimeType === 'color') {
            val = transformColorValue(val as string);
        }

        return {
            type: runtimeType,
            value: val
        } as EvalValue;
    };
}

function optWrapper<ValueType extends EvalValue>(
    func: (ctx: EvalContext, dict: DictValue, ...path: StringValue[]) => EvalValue,
    fallbackType: EvalTypes
) {
    return (ctx: EvalContext, fallback: ValueType, dict: DictValue, ...path: StringValue[]) => {
        try {
            return func(ctx, dict, ...path);
        } catch (_err) {
            // ignore error

            let value = fallback.value;
            if (fallbackType === 'color') {
                value = transformColorValue(value as string);
            }
            return {
                type: fallbackType,
                value
            } as unknown as EvalValue;
        }
    };
}

const getDictString = dictGetter('string', 'string');
const getDictNumber = dictGetter('number', 'number');
const getDictInteger = dictGetter('number', 'integer');
const getDictBoolean = dictGetter('boolean', 'boolean');
const getDictColor = dictGetter('string', 'color');
const getDictUrl = dictGetter('string', 'url');
const getDictArray = dictGetter('array', 'array');
const getDictDict = dictGetter('object', 'dict');

const getDictOptString = optWrapper<StringValue>(getDictString, 'string');
const getDictOptNumber = optWrapper<NumberValue>(getDictNumber, 'number');
const getDictOptInteger = optWrapper<IntegerValue>(getDictInteger, 'integer');
const getDictOptBoolean = optWrapper<BooleanValue>(getDictBoolean, 'boolean');
const getDictOptColor = optWrapper<BooleanValue>(getDictColor, 'color');
const getDictOptUrl = optWrapper<BooleanValue>(getDictUrl, 'url');

function getDictOptArray(ctx: EvalContext, dict: DictValue, ...path: StringValue[]): EvalValue {
    try {
        return getDictArray(ctx, dict, ...path);
    } catch (_err) {
        // ignore error
        return {
            type: ARRAY,
            value: []
        } as unknown as EvalValue;
    }
}

function getDictOptDict(ctx: EvalContext, dict: DictValue, ...path: StringValue[]): EvalValue {
    try {
        return getDictDict(ctx, dict, ...path);
    } catch (_err) {
        // ignore error
        return {
            type: DICT,
            value: {}
        } as unknown as EvalValue;
    }
}

export function registerDict(): void {
    registerFunc('getDictString', [
        DICT, {
            type: STRING,
            isVararg: true
        }
    ], getDictString);
    registerFunc('getStringFromDict', [
        DICT, {
            type: STRING,
            isVararg: true
        }
    ], getDictString);

    registerFunc('getDictNumber', [
        DICT, {
            type: STRING,
            isVararg: true
        }
    ], getDictNumber);
    registerFunc('getNumberFromDict', [
        DICT, {
            type: STRING,
            isVararg: true
        }
    ], getDictNumber);

    registerFunc('getDictInteger', [
        DICT, {
            type: STRING,
            isVararg: true
        }
    ], getDictInteger);
    registerFunc('getIntegerFromDict', [
        DICT, {
            type: STRING,
            isVararg: true
        }
    ], getDictInteger);

    registerFunc('getDictBoolean', [
        DICT, {
            type: STRING,
            isVararg: true
        }
    ], getDictBoolean);
    registerFunc('getBooleanFromDict', [
        DICT, {
            type: STRING,
            isVararg: true
        }
    ], getDictBoolean);

    registerFunc('getDictColor', [
        DICT, {
            type: STRING,
            isVararg: true
        }
    ], getDictColor);
    registerFunc('getColorFromDict', [
        DICT, {
            type: STRING,
            isVararg: true
        }
    ], getDictColor);

    registerFunc('getDictUrl', [
        DICT, {
            type: STRING,
            isVararg: true
        }
    ], getDictUrl);
    registerFunc('getUrlFromDict', [
        DICT, {
            type: STRING,
            isVararg: true
        }
    ], getDictUrl);

    registerFunc('getDictOptString', [
        STRING, DICT, {
            type: STRING,
            isVararg: true
        }
    ], getDictOptString);
    registerFunc('getOptStringFromDict', [
        STRING, DICT, {
            type: STRING,
            isVararg: true
        }
    ], getDictOptString);

    registerFunc('getDictOptNumber', [
        NUMBER, DICT, {
            type: STRING,
            isVararg: true
        }
    ], getDictOptNumber);
    registerFunc('getOptNumberFromDict', [
        NUMBER, DICT, {
            type: STRING,
            isVararg: true
        }
    ], getDictOptNumber);

    registerFunc('getDictOptInteger', [
        INTEGER, DICT, {
            type: STRING,
            isVararg: true
        }
    ], getDictOptInteger);
    registerFunc('getOptIntegerFromDict', [
        INTEGER, DICT, {
            type: STRING,
            isVararg: true
        }
    ], getDictOptInteger);

    registerFunc('getDictOptBoolean', [
        BOOLEAN, DICT, {
            type: STRING,
            isVararg: true
        }
    ], getDictOptBoolean);
    registerFunc('getOptBooleanFromDict', [
        BOOLEAN, DICT, {
            type: STRING,
            isVararg: true
        }
    ], getDictOptBoolean);

    registerFunc('getDictOptColor', [
        COLOR, DICT, {
            type: STRING,
            isVararg: true
        }
    ], getDictOptColor);
    registerFunc('getOptColorFromDict', [
        COLOR, DICT, {
            type: STRING,
            isVararg: true
        }
    ], getDictOptColor);

    registerFunc('getDictOptColor', [
        STRING, DICT, {
            type: STRING,
            isVararg: true
        }
    ], getDictOptColor);
    registerFunc('getOptColorFromDict', [
        STRING, DICT, {
            type: STRING,
            isVararg: true
        }
    ], getDictOptColor);

    registerFunc('getDictOptUrl', [
        STRING, DICT, {
            type: STRING,
            isVararg: true
        }
    ], getDictOptUrl);
    registerFunc('getOptUrlFromDict', [
        STRING, DICT, {
            type: STRING,
            isVararg: true
        }
    ], getDictOptUrl);

    registerFunc('getDictOptUrl', [
        URL, DICT, {
            type: STRING,
            isVararg: true
        }
    ], getDictOptUrl);
    registerFunc('getOptUrlFromDict', [
        URL, DICT, {
            type: STRING,
            isVararg: true
        }
    ], getDictOptUrl);

    registerFunc('getDictFromDict', [
        DICT, {
            type: STRING,
            isVararg: true
        }
    ], getDictDict);

    registerFunc('getArrayFromDict', [
        DICT, {
            type: STRING,
            isVararg: true
        }
    ], getDictArray);

    registerFunc('getOptArrayFromDict', [
        DICT, {
            type: STRING,
            isVararg: true
        }
    ], getDictOptArray);

    registerFunc('getOptDictFromDict', [
        DICT, {
            type: STRING,
            isVararg: true
        }
    ], getDictOptDict);
}
