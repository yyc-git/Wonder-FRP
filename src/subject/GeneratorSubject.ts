/// <reference path="../filePath.d.ts"/>
module wdFrp{
    export class GeneratorSubject extends Entity implements IObserver {
        public static create() {
            var obj = new this();

            return obj;
        }

        private _isStart:boolean = false;
        get isStart(){
            return this._isStart;
        }
        set isStart(isStart:boolean){
            this._isStart = isStart;
        }

        constructor(){
            super("GeneratorSubject");
        }

        public observer:any = new SubjectObserver();

        /*!
        outer hook method
         */
        public onBeforeNext(value:any){
        }

        public onAfterNext(value:any) {
        }

        public onIsCompleted(value:any) {
            return false;
        }

        public onBeforeError(error:any) {
        }

        public onAfterError(error:any) {
        }

        public onBeforeCompleted() {
        }

        public onAfterCompleted() {
        }


        //todo
        public subscribe(arg1?:Function|Observer, onError?:Function, onCompleted?:Function):IDisposable{
            var observer = arg1 instanceof Observer
                ? <AutoDetachObserver>arg1
                    : AutoDetachObserver.create(<Function>arg1, onError, onCompleted);

            this.observer.addChild(observer);

            return InnerSubscription.create(this, observer);
        }

        public next(value:any){
            if(!this._isStart || this.observer.isEmpty()){
                return;
            }

            try{
                this.onBeforeNext(value);

                this.observer.next(value);

                this.onAfterNext(value);

                if(this.onIsCompleted(value)){
                    this.completed();
                }
            }
            catch(e){
                this.error(e);
            }
        }

        public error(error:any){
            if(!this._isStart || this.observer.isEmpty()){
                return;
            }

            this.onBeforeError(error);

            this.observer.error(error);

            this.onAfterError(error);
        }

        public completed(){
            if(!this._isStart || this.observer.isEmpty()){
                return;
            }

            this.onBeforeCompleted();

            this.observer.completed();

            this.onAfterCompleted();
        }

        public toStream(){
            var self = this,
                stream = null;

            stream = AnonymousStream.create((observer:Observer) => {
                self.subscribe(observer);
            });

            return stream;
        }

        public start(){
            var self = this;

            this._isStart = true;

            this.observer.setDisposable(SingleDisposable.create(() => {
                self.dispose();
            }));
        }

        public stop(){
            this._isStart = false;
        }

        public remove(observer:Observer){
            this.observer.removeChild(observer);
        }

        public dispose(){
            this.observer.dispose();
        }
    }
}
