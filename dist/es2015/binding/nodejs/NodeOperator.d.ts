import { AnonymousStream } from "../../stream/AnonymousStream";
export declare var fromNodeCallback: (func: Function, context?: any) => (...funcArgs: any[]) => AnonymousStream;
export declare var fromStream: (stream: any, finishEventName?: string) => AnonymousStream;
export declare var fromReadableStream: (stream: any) => AnonymousStream;
export declare var fromWritableStream: (stream: any) => AnonymousStream;
export declare var fromTransformStream: (stream: any) => AnonymousStream;
