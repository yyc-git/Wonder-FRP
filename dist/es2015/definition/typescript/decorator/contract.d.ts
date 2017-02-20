export declare function assert(cond: boolean, message?: string): void;
export declare function require(InFunc: any): (target: any, name: any, descriptor: any) => any;
export declare function ensure(OutFunc: any): (target: any, name: any, descriptor: any) => any;
export declare function requireGetter(InFunc: any): (target: any, name: any, descriptor: any) => any;
export declare function requireSetter(InFunc: any): (target: any, name: any, descriptor: any) => any;
export declare function ensureGetter(OutFunc: any): (target: any, name: any, descriptor: any) => any;
export declare function ensureSetter(OutFunc: any): (target: any, name: any, descriptor: any) => any;
export declare function invariant(func: any): (target: any) => void;
