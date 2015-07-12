/// <reference path="../definitions.d.ts"/>
module dyRt{
    export class DoStream extends BaseStream{
        public static create(source:Stream, onNext?:Function, onError?:Function, onCompleted?:Function) {
            var obj = new this(source, onNext, onError, onCompleted);

            return obj;
        }

        private _source:Stream = null;

        constructor(source:Stream, onNext:Function, onError:Function, onCompleted:Function){
            super(null);

            this._source = source;

            this.scheduler = this._source.scheduler;
            this.scheduler.addWrapTarget(AnonymousObserver.create(onNext, onError,onCompleted));
        }

        public subscribe(arg1:Function|Observer|Subject, onError?, onCompleted?):IDisposable {
            return this._source.subscribe.apply(this._source, arguments);
        }

        public subscribeCore(){
            if(this._source instanceof BaseStream){
                let baseStream = <BaseStream>this._source;
                baseStream.subscribeCore();
            }
        }
    }
}
