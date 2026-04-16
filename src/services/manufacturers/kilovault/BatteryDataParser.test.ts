/**
 * @jest-environment jsdom
 */
import { describe, expect, it } from '@jest/globals';
import { act, renderHook } from '@testing-library/react';
import { atom, useAtom } from 'jotai';
import { RESET, UNDO, withHistory } from 'jotai-history';
import base64 from 'react-native-base64';
import { BatteryDataChunk, BatteryDataParser } from './BatteryDataParser';

describe('BatteryDataParser', () => {
    it('should instantiate correctly', () => {
        const parser = new BatteryDataParser();
        expect(parser).toBeDefined();
    });

    it('should expose a parse method', () => {
        const parser = new BatteryDataParser();
        expect(typeof (parser as unknown as { parse?: unknown }).parse).toBe('function');
    });

    it('should parse valid battery data', () => {
        const data = test_data; // test_data.slice(0, 8);
        const chunks = data.map(d => base64.decode(d).split('').map(c => c.charCodeAt(0)));
        const buffer = new Uint8Array(chunks.flat());


        const parser = new BatteryDataParser();
        let consumed = 0;
        while (consumed < buffer.length) {
            const arr = buffer.subarray(consumed);
            console.log('Buffer Slice:', arr);
            const result = parser.parse(arr);
            if (result) {
                console.log('Parsed Result:', result, 'Head Position:', parser.consumed, buffer[consumed + parser.consumed]);
                consumed += parser.consumed;
                expect(result?.voltage).toEqual(12970);

            } else {
                consumed += 1; // Move forward if no valid packet is found
            }
        }

        expect(parser).toBeDefined();
    });

    it('learning how to use jotai-history', () => {

        const chunk = atom<string>('initial');
        const historyAtom = withHistory(chunk, 20);

        const { result } = renderHook(() => useAtom(historyAtom));

        expect(result).toBeDefined();

        const [[current, ...history], pushChunk] = result.current;

        expect(current).toEqual('initial');
        expect(history.slice(1)).toEqual([]);

        act(() => {
            pushChunk((previous) => "v1");
        });

        act(() => {
            pushChunk((previous) => "v2");
            pushChunk((previous) => "v3");

        });

        const [...h2] = result.current[0];
        console.log('Current:', result.current, 'History:', h2);
        const [[val, prev], setAtom] = result.current;
        expect(val).toEqual('v3');
        expect(prev).toEqual('v2');

        // Trigger undo
        act(() => {
            setAtom(UNDO);
        });

        const [afterUndo] = result.current[0];
        expect(afterUndo).toEqual('v2');
    });



    it('withHistory read history and reset', () => {

        
        const chunk = atom<BatteryDataChunk>();
        const chunkHistory = withHistory(chunk, 50);

        const { result } = renderHook(() => useAtom(chunkHistory));
        const [, pushChunk] = result.current;

        // Push test data
        act(() => {
            test_data.map(d => {
                pushChunk((prev) => d);
            });
        });


        const [[current, ...history]] = result.current;

        expect(current).toEqual('MDAwODkyMDEwMDA4MDAzRQ==');
        // expect(history.slice(1)).toEqual(['v2', 'v1', 'initial']);


        // Get all history values


        const chunks = [current, ...history];
        expect(chunks.length).toBe(50); // +1 for the initial value

        // Reset history

        expect(result.current[0][0]).toEqual("MDAwODkyMDEwMDA4MDAzRQ==");
        expect(result.current[0][1]).toBeDefined();

        act(() => {
            pushChunk(RESET);
        });

        // check that history is reset
        expect(result.current[0][1]).toBeUndefined();

        // transform to uint8 arrays, and parse with BatteryDataParser
        const data = chunks.reverse();

        const parser = new BatteryDataParser();
        const battery = parser.parseBase64Array(data as BatteryDataChunk[]);
        console.log('Parsed Battery Data:', battery);


    });


});


const test_data = [
    "sEFBMzIwMDAwMDAwMDAwMDA=",
    "MDg5MjAxMDAwODAwM0UwMDY5MEI=",
    "MDAwMTAwMDBBQTBDQjEwQ0IwMEM=",
    "QTAwQzAwMDAwMDAwMDAwMDAwMDA=",
    "MDAwMDAwMDAwMDAwMDAwMDAwMDA=",
    "MDAwMDAwMDAwMDAwMDUwRFJSUlI=",
    "UlJSUrBBQTMyMDAwMDAwMDAwMDA=",
    "MDA4OTIwMTAwMDgwMDNFMDA2OTA=",
    "QjAwMDEwMDAwQUIwQ0IxMENCMDA=",
    "Q0EwMEMwMDAwMDAwMDAwMDAwMDA=",
    "MDAwMDAwMDAwMDAwMDAwMDAwMDA=",
    "MDAwMDAwMDAwMDAwMDA1MEVSUlI=",
    "UlJSUlKwQUEzMjAwMDAwMDAwMDA=",
    "MDAwODkyMDEwMDA4MDAzRTAwNjk=",
    "MEIwMDAxMDAwMEFBMENCMTBDQjE=",
    "MENBMDBDMDAwMDAwMDAwMDAwMDA=",
    "MDAwMDAwMDAwMDAwMDAwMDAwMDA=",
    "MDAwMDAwMDAwMDAwMDAwNTBFUlI=",
    "UlJSUlJSsEFBMzIwMDAwMDAwMDA=",
    "MDAwNTBEUlJSUlJSUlKwQUE=",
    "MzIwMDAwMDAwMDAwMDAwOA==",
    "OTIwMTAwMDgwMDNF",
    "MDA2OTBCMDAwMTAwMDBBQQ==",
    "MENCMTBDQjAwQ0EwMEMwMA==",
    "MDAwMDAwMDAwMDAwMDAwMA==",
    "MDAwMDAwMDAwMDAwMDAwMA==",
    "MDAwMDAwMDAwMDAw",
    "MDAwNTBEUlJSUlJSUlKwQUE=",
    "MzIwMDAwMDAwMDAwMDAwOA==",
    "OTIwMTAwMDgwMDNF",
    "MDA2OTBCMDAwMTAwMDBBQg==",
    "MENCMTBDQjEwQ0EwMEMwMA==",
    "MDAwMDAwMDAwMDAwMDAwMA==",
    "MDAwMDAwMDAwMDAwMDAwMA==",
    "MDAwMDAwMDAwMDAw",
    "MDAwNTBGUlJSUlJSUlKwQUE=",
    "MzIwMDAwMDAwMDAwMDAwOA==",
    "OTIwMTAwMDgwMDNF",
    "MDA2OTBCMDAwMTAwMDBBQQ==",
    "MENCMTBDQjAwQ0EwMEMwMA==",
    "MDAwMDAwMDAwMDAwMDAwMA==",
    "MDAwMDAwMDAwMDAwMDAwMA==",
    "MDAwMDAwMDAwMDAw",
    "MDAwNTBEUlJSUlJSUlKwQUE=",
    "MzIwMDAwMDAwMDAwMDAwOA==",
    "OTIwMTAwMDgwMDNF",
    "MDA2OTBCMDAwMTAwMDBBQg==",
    "MENCMTBDQjEwQ0EwMEMwMA==",
    "MDAwMDAwMDAwMDAwMDAwMA==",
    "MDAwMDAwMDAwMDAwMDAwMA==",
    "MDAwMDAwMDAwMDAw",
    "MDAwNTBGUlJSUlJSUlKwQUE=",
    "MzIwMDAwMDAwMDAwMDAwOA==",
    "OTIwMTAwMDgwMDNF",
    "MDA2OTBCMDAwMTAwMDBBQQ==",
    "MENCMTBDQjAwQ0EwMEMwMA==",
    "MDAwMDAwMDAwMDAwMDAwMA==",
    "MDAwMDAwMDAwMDAwMDAwMA==",
    "MDAwMDAwMDAwMDAw",
    "MDAwNTBEUlJSUlJSUlKwQUE=",
    "MzIwMDAwMDAwMDAwMDAwOA==",
    "OTIwMTAwMDgwMDNF",
    "MDA2OTBCMDAwMTAwMDBBQQ==",
    "MENCMTBDQjAwQ0EwMEMwMA==",
    "MDAwMDAwMDAwMDAwMDAwMA==",
    "MDAwMDAwMDAwMDAwMDAwMA==",
    "MDAwMDAwMDAwMDAw",
    "MDAwNTBEUlJSUlJSUlKwQUE=",
    "MzIwMDAwMDAwMDAwMDAwOA==",
    "OTIwMTAwMDgwMDNFMDA2OQ==",
    "MEIwMDAxMDAwMEFBMENCMQ==",
    "MENCMTBDQTAwQzAwMDAwMA==",
    "MDAwMDAwMDAwMDAwMDAwMA==",
    "MDAwMDAwMDAwMDAw",
    "MDAwMDAwMDAwMDAwMDAwNTA=",
    "RVJSUlJSUlJSsEFBMzIwMA==",
    "MDAwMDAwMDAwMDA4",
    "OTIwMTAwMDgwMDNFMDA2OQ==",
    "MEIwMDAxMDAwMEFBMENCMQ==",
    "MENCMDBDQTAwQzAwMDAwMA==",
    "MDAwMDAwMDAwMDAwMDAwMA==",
    "MDAwMDAwMDAwMDAw",
    "MDAwMDAwMDAwMDAwMDAwNTA=",
    "RFJSUlJSUlJSsEFBMzIwMA==",
    "MDAwMDAwMDAwMDA4",
    "OTIwMTAwMDgwMDNFMDBBQQ==",
    "MA==",
    "Q0IxMENCMDBDQTEwQzAwMA==",
    "MDAwMDAwMDAwMDAwMDAwMA==",
    "MDAwMDAwMDAwMDAw",
    "MDAwMDAwMDAwMDAwMDAwMDA=",
    "MDUwRVJSUlJSUlJSsEFBMw==",
    "MjAwMDAwMDAwMDAw",
    "MDA4OTIwMTAwMDgwMDNFMA==",
    "MDY5MEIwMDAxMDAwMEFCMA==",
    "Q0IxMENCMTBDQTAwQzAwMA==",
    "MDAwMDAwMDAwMDAwMDAwMA==",
    "MDAwMDAwMDAwMDAw",
    "MDAwMDAwMDAwMDAwMDAwMDA=",
    "MDUwRlJSUlJSUlJSsEFBMw==",
    "MjAwMDAwMDAwMDAw",
    "MDA4OTIwMTAwMDgwMDNFMA==",
    "MDY5MEIwMDAxMDAwMEFCMA==",
    "Q0IxMENCMDBDQTEwQ/8wMA==",
    "MDAwMDAwMDAwMDAwMDAwMA==",
    "MDAwMDAwMDAwMDAw",
    "MDAwNTBGUlJSUlJSUlKwQUE=",
    "MzIwMDAwMDAwMDAwMDAwOA==",
    "OTIwMTAwMDgwMDNF",
    "MDA2OTBCMDAwMTAwMDBBQQ==",
    "MENCMTBDQjAwQ0ExMEMwMA==",
    "MDAwMDAwMDAwMDAwMDAwMA==",
    "MDAwMDAwMDAwMDAwMDAwMA==",
    "MDAwMDAwMDAwMDAw",
    "MDAwNTBFUlJSUlJSUlKwQUE=",
    "MzIwMDAwMDAwMDAwMDAwOA==",
    "OTIwMTAwMDgwMDNF",
    "MDA2OTBCMDAwMTAwMDBBQQ==",
    "MENCMTBDQjAwQ0EwMEMwMA==",
    "MDAwMDAwMDAwMDAwMDAwMA==",
    "MDAwMDAwMDAwMDAwMDAwMA==",
    "MDAwMDAwMDAwMDAw",
    "MDAwNTBEUlJSUlJSUlKwQUE=",
    "MzIwMDAwMDAwMDAwMDAwOA==",
    "OTIwMTAwMDgwMDNF",
    "MDA2OTBCMDAwMTAwMDBBQQ==",
    "MENCMTBDQjAwQ0EwMEMwMA==",
    "MDAwMDAwMDAwMDAwMDAwMA==",
    "MDAwMDAwMDAwMDAwMDAwMA==",
    "MDAwMDAwMDAwMDAw",
    "MDAwNTBEUlJSUlJSUlKwQUE=",
    "MzIwMDAwMDAwMDAwMDAwOA==",
    "OTIwMTAwMDgwMDNF",
    "MDA2OTBCMDAwMTAwMDBBQQ==",
    "MENCMTBDQjEwQ0EwMEMwMA==",
    "MDAwMDAwMDAwMDAwMDAwMA==",
    "MDAwMDAwMDAwMDAwMDAwMA==",
    "MDAwMDAwMDAwMDAw",
    "MDAwNTBFUlJSUlJSUlKwQUE=",
    "MzIwMDAwMDAwMDAwMDAwOA==",
    "OTIwMTAwMDgwMDNF",
    "MDA2OTBCMDAwMTAwMDBBQQ==",
    "MENCMTBDQjAwQ0EwMEMwMA==",
    "MDAwMDAwMDAwMDAwMDAwMA==",
    "MDAwMDAwMDAwMDAwMDAwMA==",
    "MDAwMDAwMDAwMDAw",
    "MDAwNTBEUlJSUlJSUlKwQUE=",
    "MzIwMDAwMDAwMDAwMDAwOA==",
    "OTIwMTAwMDgwMDNF",
    "MDA2OTBCMDAwMTAwMDBBQQ==",
    "MENCMTBDQjAwQ0EwMEMwMA==",
    "MDAwMDAwMDAwMDAwMDAwMA==",
    "MDAwMDAwMDAwMDAwMDAwMA==",
    "MDAwMDAwMDAwMDAw",
    "MDAwNTBEUlJSUlJSUlKwQUE=",
    "MzIwMDAwMDAwMDAwMDAwOA==",
    "OTIwMTAwMDgwMDNF",
    "MDA2OTBCMDAwMTAwMDBBQQ==",
    "MENCMTBDQjAwQ0ExMEMwMA==",
    "MDAwMDAwMDAwMDAwMDAwMA==",
    "MDAwMDAwMDAwMDAwMDAwMA==",
    "MDAwMDAwMDAwMDAw",
    "MDAwNTBFUlJSUlJSUlKwQUE=",
    "MzIwMDAwMDAwMDAwMDAwOA==",
    "OTIwMTAwMDgwMDNF",
    "MDA2OTBCMDAwMTAwMDBBQQ==",
    "MENCMTBDQjAwQ0ExMEMwMA==",
    "MDAwMDAwMDAwMDAwMDAwMA==",
    "MDAwMDAwMDAwMDAwMDAwMA==",
    "MDAwMDAwMDAwMDAw",
    "MDAwNTBFUlJSUlJSUlKwQUE=",
    "MzIwMDAwMDAwMDAwMDAwOA==",
    "OTIwMTAwMDgwMDNF",
    "MDA2OTBCMDAwMTAwMDBBQg==",
    "MENCMTBDQjEwQ0EwMEMwMA==",
    "MDAwMDAwMDAwMDAwMDAwMA==",
    "MDAwMDAwMDAwMDAwMDAwMA==",
    "MDAwMDAwMDAwMDAw",
    "MDAwNTBGUlJSUlJSUlKwQUE=",
    "MzIwMDAwMDAwMDAwMDAwOA==",
    "OTIwMTAwMDgwMDNF",
    "MDA2OTBCMDAwMTAwMDBBQQ==",
    "MENCMTBDQjEwQ0ExMEMwMA==",
    "MDAwMDAwMDAwMDAwMDAwMA==",
    "MDAwMDAwMDAwMDAwMDAwMA==",
    "MDAwMDAwMDAwMDAw",
    "MDAwNTBGUlJSUlJSUlKwQUE=",
    "MzIwMDAwMDAwMDAwMDAwOA==",
    "OTIwMTAwMDgwMDNF",
    "MDA2OTBCMDAwMTAwMDBBQg==",
    "MENCMTBDQjAwQ0ExMEMwMA==",
    "MDAwMDAwMDAwMDAwMDAwMA==",
    "MDAwMDAwMDAwMDAwMDAwMA==",
    "MDAwMDAwMDAwMDAw",
    "MDAwNTBGUlJSUlJSUlKwQUE=",
    "MzIwMDAwMDAwMDAwMDAwOA==",
    "OTIwMTAwMDgwMDNF",
    "MDA2OTBCMDAwMTAwMDBBQQ==",
    "MENCMTBDQjAwQ0EwMEMwMA==",
    "MDAwMDAwMDAwMDAwMDAwMA==",
    "MDAwMDAwMDAwMDAwMDAwMA==",
    "MDAwMDAwMDAwMDAw",
    "MDAwNTBEUlJSUlJSUlKwQUE=",
    "MzIwMDAwMDAwMDAwMDAwOA==",
    "OTIwMTAwMDgwMDNF",
    "MDA2OTBCMDAwMTAwMDBBQQ==",
    "MENCMTBDQjAwQ0EwMEMwMA==",
    "MDAwMDAwMDAwMDAwMDAwMA==",
    "MDAwMDAwMDAwMDAwMDAwMA==",
    "MDAwMDAwMDAwMDAw",
    "MDAwNTBEUlJSUlJSUlKwQUE=",
    "MzIwMDAwMDAwMDAw",
    "MDAwODkyMDEwMDA4MDAzRQ==",
    "MDA2OTBCMDAwMTAwMDBBQQ==",
    "MENCMTBDQjAwQ0EwMEMwMA==",
    "MDAwMDAwMDAwMDAwMDAwMA==",
    "MDAwMDAwMDAwMDAw",
    "MDAwMDAwMDAwMDAwMDAwMDA=",
    "MDA1MERSUlJSUlJSUrBBQQ==",
    "MzIwMDAwMDAwMDAw",
    "MDAwODkyMDEwMDA4MDAzRQ=="

];