module wdFrp{
    export class GroupDisposable extends Entity implements IDisposable{
        public static create(disposable?:IDisposable) {
            var obj = new this(disposable);

            return obj;
        }

        private _group:wdCb.Collection<IDisposable> = wdCb.Collection.create<IDisposable>();

        constructor(disposable?:IDisposable){
            super("GroupDisposable");

            if(disposable){
                this._group.addChild(disposable);
            }
        }

        public add(disposable:IDisposable){
            this._group.addChild(disposable);

            return this;
        }

        public remove(disposable:IDisposable){
            this._group.removeChild(disposable);

            return this;
        }

        public dispose(){
            this._group.forEach((disposable:IDisposable) => {
                disposable.dispose();
            })
        }
    }
}

