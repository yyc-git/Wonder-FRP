/// <reference path="../core/Observer"/>
/// <reference path="Record"/>
/// <reference path="TestScheduler"/>
module dyRt{
    export class MockObserver extends Observer{
        private _messages:[Record] = <[Record]>[];
        get messages(){
            return this._messages;
        }
        set messages(messages:[Record]){
            this._messages = messages;
        }

        private _scheduler:TestScheduler = null;

        constructor(scheduler){
            super(null, null, null);

            this._scheduler = scheduler;
        }

        protected onNext(value){
            this._messages.push(new Record(this._scheduler.clock, value));
            this._scheduler.clock ++;
        }

        protected onError(error){
            this._messages.push(new Record(this._scheduler.clock, error));
            this._scheduler.clock ++;
        }

        protected onCompleted(){
            this._messages.push(new Record(this._scheduler.clock, null));
            //this._scheduler.clock ++;
        }
    }
}
