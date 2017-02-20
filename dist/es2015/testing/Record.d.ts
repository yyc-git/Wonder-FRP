import { ActionType } from "./ActionType";
export declare class Record {
    static create(time: number, value: any, actionType?: ActionType, comparer?: Function): Record;
    private _time;
    time: number;
    private _value;
    value: number;
    private _actionType;
    actionType: ActionType;
    private _comparer;
    constructor(time: any, value: any, actionType: ActionType, comparer: Function);
    equals(other: any): any;
}
