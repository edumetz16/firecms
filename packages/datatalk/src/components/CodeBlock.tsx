import React, { useEffect, useState } from "react";
import * as firestoreLibrary from "firebase/firestore";
import { firestoreToCMSModel } from "@firecms/firebase";
import { CircularProgressCenter, EntityCollection } from "@firecms/core";
import { Button, cn, Paper } from "@firecms/ui";
import { buildPropertiesOrder } from "@firecms/schema_inference";
import { AutoHeightEditor } from "./AutoHeightEditor";
import { getPropertiesFromData } from "@firecms/collection_editor_firebase";
import { extractStringLiterals } from "../utils/extract_literals";
import { TableResults } from "./TableResults";

// @ts-ignore
window.firestoreLibrary = firestoreLibrary

function ExecutionErrorView(props: { executionError: Error }) {
    const message = props.executionError.message;
    const urlRegex = /https?:\/\/[^\s]+/g;
    const htmlContent = message.replace(urlRegex, (url) => {
        // For each URL found, replace it with an HTML <a> tag
        return `<a href="${url}" target="_blank" class="underline">LINK</a><br/>`;
    });

    return <div className={"w-full text-sm bg-red-100 dark:bg-red-800 p-4 rounded-lg"}>
        <code className={"text-red-700 dark:text-red-300 break-all"} dangerouslySetInnerHTML={{ __html: htmlContent }}/>
    </div>;
}

export function CodeBlock({
                              initialCode,
                              maxWidth,
                              sourceLoading,
                              autoRunCode,
                              onCodeRun,
                              collections
                          }: {
    initialCode?: string,
    sourceLoading?: boolean,
    maxWidth?: number,
    autoRunCode?: boolean,
    onCodeRun?: () => void,
    collections?: EntityCollection[]
}) {

    const textAreaRef = React.useRef<HTMLDivElement>(null);
    const [inputCode, setInputCode] = useState<string | undefined>(initialCode);

    const [loading, setLoading] = useState<boolean>(false);
    const [querySnapshot, setQuerySnapshot] = useState<firestoreLibrary.QuerySnapshot | null>(null);
    const [codePriorityKeys, setCodePriorityKeys] = useState<string[] | undefined>();

    const [executionResult, setExecutionResult] = useState<any | null>();
    const [codeHasBeenRun, setCodeHasBeenRun] = useState<boolean>(false);
    const [consoleOutput, setConsoleOutput] = useState<string>("");

    const [executionError, setExecutionError] = useState<Error | null>(null);
    const mounted = React.useRef(false);

    useEffect(() => {
        setInputCode(initialCode);
        if (autoRunCode && !mounted.current && initialCode && !sourceLoading) {
            executeQuery();
        }
        mounted.current = true;
    }, [sourceLoading, initialCode, autoRunCode]);

    const handleCodeChange = (value?: string) => {
        setInputCode(value);
    };

    async function displayQuerySnapshotData(querySnapshot: firestoreLibrary.QuerySnapshot, priorityKeys?: string[]) {
        setQuerySnapshot(querySnapshot);
        setCodePriorityKeys(priorityKeys);
    }

    const executeQuery = async () => {

        if (!inputCode) {
            return;
        }

        console.log("Executing code", inputCode);

        setCodeHasBeenRun(true);

        setLoading(true);
        setExecutionError(null);

        try {
            pipeConsoleLog((...args) => {
                setConsoleOutput((prev) => prev + Array.from(args).join(" ") + "\n");
            });
            const encodedJs = encodeURIComponent(inputCode);
            const dataUri = "data:text/javascript;charset=utf-8," + buildAuxScript() + encodedJs;
            const promise = import(/* @vite-ignore */dataUri);
            promise.then((module) => {
                originalConsoleLog("Module loaded", module);
                setConsoleOutput("");
                if (!module.default) {
                    setExecutionError(new Error("No default export found. Make sure your code is exporting a default function."));
                    setLoading(false);
                    return;
                }
                module.default()
                    .then(async (codeExport: any) => {
                        originalConsoleLog("Code loaded", codeExport, typeof codeExport);
                        let codeResult;
                        if (codeExport instanceof Promise) {
                            codeResult = await codeExport;
                        } else if (typeof codeExport === "function") {
                            codeResult = await codeExport();
                        } else {
                            codeResult = codeExport;
                        }

                        if (codeResult instanceof firestoreLibrary.QuerySnapshot) {
                            const priorityKeys = extractStringLiterals(inputCode);
                            return displayQuerySnapshotData(codeResult, priorityKeys);
                        } else if (codeResult instanceof firestoreLibrary.DocumentReference) {
                            return setExecutionResult("Document added successfully with reference: " + codeResult.path);
                        } else if (codeResult instanceof firestoreLibrary.DocumentSnapshot) {
                            const res = JSON.stringify(codeResult.data(), null, 2);
                            originalConsoleLog("Document data", res);
                            return setExecutionResult(res);
                        } else if (typeof codeExport === "undefined") {
                            return setExecutionResult("Code executed successfully");
                        } else {
                            return setExecutionResult(codeResult);
                        }
                    })
                    .catch((error: any) => {
                        setExecutionError(error);
                        console.error("Error executing query:", error);
                    })
                    .finally(() => {
                        setLoading(false);
                        onCodeRun?.();
                        resetConsolePipe();
                    });
            })
                .catch((error) => {
                    setExecutionError(error);
                    console.error("Error loading module:", error);
                    setLoading(false);
                    resetConsolePipe();
                });
        } catch (error: any) {
            setLoading(false);
            setExecutionError(error);
            console.error("Error executing query:", error);
        }
    };

    return (
        <div className={"flex flex-col my-4 gap-2"}
             style={{
                 maxWidth: maxWidth ? maxWidth + "px" : undefined
             }}>

            <div className={"flex flex-row w-full gap-4"}
                 ref={textAreaRef}>
                <AutoHeightEditor
                    value={inputCode}
                    maxWidth={maxWidth ? maxWidth - 96 : undefined}
                    onChange={handleCodeChange}
                />
                <Button size="small"
                        variant={codeHasBeenRun ? "outlined" : "filled"}
                        onClick={executeQuery}
                        disabled={!inputCode}>Run Code</Button>
            </div>

            {executionError && (
                <ExecutionErrorView executionError={executionError}/>
            )}

            {(querySnapshot || loading || consoleOutput || executionResult) && (
                <div
                    style={{
                        marginLeft: querySnapshot ? "-64px" : undefined,
                        width: querySnapshot ? "calc(100% + 64px)" : undefined
                    }}
                    className={cn("w-full rounded-lg shadow-sm overflow-hidden transition-all", {
                        "h-[480px]": querySnapshot,
                        "h-[92px]": !querySnapshot && loading
                    })}>
                    {loading && <CircularProgressCenter/>}

                    {querySnapshot && <TableResults querySnapshot={querySnapshot}
                                                    priorityKeys={codePriorityKeys}
                                                    collections={collections}/>}

                    {(consoleOutput || executionResult) && (
                        <Paper className={"w-full p-4 min-h-[92px] font-mono text-xs overflow-auto rounded-lg"}>
                            {consoleOutput && <pre className={"text-sm font-mono text-gray-700 dark:text-gray-300"}>
                                {consoleOutput}
                            </pre>}
                            {executionResult && <pre className={"text-xs font-mono text-gray-700 dark:text-gray-300"}>
                                    {typeof executionResult === "string" ? executionResult : JSON.stringify(executionResult, null, 2)}
                            </pre>}
                        </Paper>
                    )}
                </div>
            )}

        </div>
    );
}

const originalConsoleDebug = console.debug;
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleInfo = console.info;

function resetConsolePipe() {
    console.debug = originalConsoleDebug;
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    console.info = originalConsoleInfo;
}

function pipeConsoleLog(onConsoleLog: (...message: any) => void) {
    console.debug = function (message) {
        onConsoleLog(message);
        originalConsoleDebug(message);
    };
    console.log = function (message) {
        onConsoleLog(message);
        originalConsoleLog(message);
    };
    console.error = function (message) {
        onConsoleLog(message);
        originalConsoleError(message);
    };
    console.warn = function (message) {
        onConsoleLog(message);
        originalConsoleWarn(message);
    };
    console.info = function (message) {
        onConsoleLog(message);
        originalConsoleInfo(message);
    };
}

function buildAuxScript() {
    return `${Object.keys(firestoreLibrary).map(key => `const ${key} = window.firestoreLibrary.${key};`).join("\n")}\n`;
}