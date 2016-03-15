module wdFrp{
    export class MockObserver extends Observer{
        public static create(scheduler:TestScheduler) {
            var obj = new this(scheduler);

            return obj;
        }

        private _messages:[Record] = <[Record]>[];
        get messages(){
            return this._messages;
        }
        set messages(messages:[Record]){
            this._messages = messages;
        }

        private _scheduler:TestScheduler = null;

        constructor(scheduler:TestScheduler){
            super(null, null, null);

            this._scheduler = scheduler;
        }

        protected onNext(value){
            var record = null;

            if(JudgeUtils.isDirectObject(value)){
                record = Record.create(this._scheduler.clock, value, ActionType.NEXT, (a, b) => {
                    var result = true;

                    for(let i in a){
                        if(a.hasOwnProperty(i)){
                            if(a[i] !== b[i]){
                                result = false;
                                break;
                            }
                        }
                    }

                    return result;
                });
            }
            else{
                record = Record.create(this._scheduler.clock, value, ActionType.NEXT);
            }

            this._messages.push(record);
        }

        protected onError(error){
            this._messages.push(Record.create(this._scheduler.clock, error, ActionType.ERROR));
        }

        protected onCompleted(){
            this._messages.push(Record.create(this._scheduler.clock, null, ActionType.COMPLETED));
        }

        public dispose(){
            super.dispose();

            this._scheduler.remove(this);
        }

        public clone(){
            var result = MockObserver.create(this._scheduler);

            result.messages = this._messages;

            return result;
        }
    }
}
