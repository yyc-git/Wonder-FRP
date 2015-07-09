/// <reference path="../definitions"/>
module dyRt {
    export class TestStream extends Stream {
        private _messages:[Record] = null;

        constructor(messages:[Record], scheduler:Scheduler) {
            super(null);

            this._messages = messages;
            this.scheduler = scheduler;
        }

        public subscribe(observer):IDisposable {
            this.scheduler.target = observer;

            return observer;
        }
    }
}
