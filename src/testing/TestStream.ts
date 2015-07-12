/// <reference path="../definitions"/>
module dyRt {
    export class TestStream extends Stream {
        public static create(messages:[Record], scheduler:Scheduler) {
            var obj = new this(messages, scheduler);

            return obj;
        }

        private _messages:[Record] = null;

        constructor(messages:[Record], scheduler:Scheduler) {
            super(null);

            this._messages = messages;
            this.scheduler = scheduler;
        }

        public subscribe(arg1:Observer|Subject):IDisposable {
            var observer = null;

            if(this.handleSubject(arg1)){
                return;
            }

            observer = arg1;

            observer.setDisposeHandler(this.scheduler.disposeHandler);

            this.scheduler.target = observer;

            this.buildStream();

            return observer;
            //return Disposable.create(this.scheduler, observer);
        }

        public subscribeCore(){
            var scheduler = <TestScheduler>(this.scheduler);

            scheduler.setStreamMap(this._messages);
        }
    }
}
