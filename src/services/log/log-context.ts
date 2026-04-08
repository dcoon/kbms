
/**
 * Automatically extracts the file and function name from the call stack.
 * Note: Stack trace parsing is computationally expensive. Use primarily in development
 * or wrap with __DEV__ checks to avoid production performance hits.
 */
export function getLogContext(): string {
    if (!__DEV__) return "";

    try {
        const err = new Error();
        const stack = err.stack?.split('\n');
        if (!stack) return "";

        // We skip:
        // [0]: Error message
        // [1]: getLogContext call
        // [2]: The logger wrapper call (if applicable)
        // [3]: The actual function that called the logger
        const callerLine = stack[3] || stack[2];
        if (!callerLine) return "";

        // Regex handles:
        // 1. "at functionName (file:line:col)" (V8/JSC)
        // 2. "functionName@file:line:col" (Hermes/Safari)
        const match = callerLine.match(/at\s+(.*)\s+\((.*):(\d+):(\d+)\)/) || 
                      callerLine.match(/(.*)@(.*):(\d+):(\d+)/);

        if (match) {
            const func = match[1] || 'anonymous';
            const path = match[2] || '';
            const file = path.split('/').pop()?.split('?')[0] || 'unknown';
            return `[${file}:${func}]`;
        }
        
        return `[${callerLine.trim()}]`;
    } catch {
        return "[context_error]";
    }
}

export function logWithContext(loggerFn: (msg: string, ...args: any[]) => void, message: string, ...args: any[]) {
    loggerFn(`${getLogContext()} ${message}`, ...args);
}

