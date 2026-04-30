/**
 * @jest-environment jsdom
 */
import { BatteryData } from '@/services/battery/battery';
import { log } from '@/services/log/log-service';
import { describe, expect, it } from '@jest/globals';
import { act, renderHook } from '@testing-library/react';
import { atom, useAtom } from 'jotai';
import { RESET, UNDO, withHistory } from 'jotai-history';
import { base64ArrayToByteArray, BatteryDataChunk, BatteryDataParser } from './BatteryDataParser';
import { TEST_CHARACTERISTIC_VALUES, TEST_DATA_TRAVIS_2026_4_18 } from "./battery-data-test-data";

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
        log.setSeverity('info');

        const data = TEST_CHARACTERISTIC_VALUES.slice(0, 12); // test_data.slice(0, 8);
        const parser = new BatteryDataParser();
        const buffer = base64ArrayToByteArray(data);


        const batteryData: (BatteryData | null)[] = [];

        let consumed = 0;
        while (consumed < buffer.length) {
            const arr = buffer.subarray(consumed);

            const result = parser.parse(arr);
            if (result) {
                consumed += parser.consumed;
                expect(result?.voltage).toEqual(12970);
                batteryData.push(result);
            } else {
                consumed += 1; // Move forward if no valid packet is found
            }
        }

        expect(parser).toBeDefined();
        expect(batteryData.length).toEqual(2);
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
            TEST_CHARACTERISTIC_VALUES.map(d => {
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


    });


    it('should parse travis 2026-4-18 data correctly', () => {

        log.setSeverity('debug');

        const data = TEST_DATA_TRAVIS_2026_4_18.map(record => record.value);
        const parser = new BatteryDataParser();
        const buffer = base64ArrayToByteArray(data);


        const batteryData: (BatteryData | null)[] = [];

        let consumed = 0;
        while (consumed < buffer.length) {

            const arr = buffer.subarray(consumed);

            const result = parser.parse(arr);
            log.debug("Loop consumed:", parser.consumed);


            if (result) {
                consumed += parser.consumed;
                expect(result?.voltage).toEqual(13100);
                expect(result?.soc).toBeLessThanOrEqual(100);
                expect(result?.soc).toBeGreaterThanOrEqual(0);
                // expect(result?.current).toEqual(0);
                expect(result?.temperature).toBeCloseTo(3041, -20);
                batteryData.push(result);
            } else {
                consumed += 1; // Move forward if no valid packet is found
            }
        }

        expect(parser).toBeDefined();
        expect(batteryData.length).toBeGreaterThan(300);

    });

    it('should parse with sliding window (atomHistory)', () => {


        log.setSeverity('debug');

        const data = TEST_DATA_TRAVIS_2026_4_18.map(record => record.value);
        const window = [];

        const parser = new BatteryDataParser();


        const batteryData: (BatteryData | null)[] = [];

        for (const chunk of data) {

            window.push(chunk);
            if (window.length > 20) {
                window.shift();
            }

            const buffer = base64ArrayToByteArray(window);


            const result = parser.parse(buffer);
            // log.debug("Loop consumed:", parser.consumed);


            if (result) {
                expect(result?.voltage).toEqual(13100);
                expect(result?.soc).toBeLessThanOrEqual(100);
                expect(result?.soc).toBeGreaterThanOrEqual(0);
                // expect(result?.current).toEqual(0);
                expect(result?.temperature).toBeCloseTo(3041, -20);
                batteryData.push(result);
            } else {
            }
        }

        expect(parser).toBeDefined();
        expect(batteryData.length).toBeGreaterThanOrEqual(339);

    });

});


