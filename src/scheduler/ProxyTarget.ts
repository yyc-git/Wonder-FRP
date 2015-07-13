/// <reference path="../definitions.d.ts"/>
module dyRt{
    export class ProxyTarget{
        public static create() {
        	var obj = new this();

        	return obj;
        }

        private _target:IObserver = null;
        get target(){
            return this._target;
        }
        set target(target:IObserver){
            this._target = target;
        }

        private _wrapTargetList:Collection = Collection.create();

        public next(value) {
            var self = this,
                resultValue = null;

            if(this._target){
                resultValue = value;

                this._execWrapTarget(function(wrapTarget){
                    try{
                        resultValue = wrapTarget.next(resultValue);
                        if(!resultValue){
                            resultValue = value;
                        }
                    }
                    catch (e) {
                        wrapTarget.error(e);
                        self._target.error(e);
                    }
                });

                try{
                    this._target.next(resultValue);
                }
                catch (e) {
                    this._target.error(e);
                }
            }
        }

        public error(error) {
            if(this._target){
                this._execWrapTarget(function(wrapTarget){
                    wrapTarget.error(error);
                });
                this._target.error(error);
            }
        }

        public completed() {
            var self = this;

            if(this._target){
                this._execWrapTarget(function(wrapTarget){
                    try{
                        wrapTarget.completed();
                    }
                    catch (e) {
                        wrapTarget.error(e);
                        self._target.error(e);
                    }
                });

                try{
                    this._target.completed();
                }
                catch (e) {
                    this._target.error(e);
                }
            }
        }

        public dispose(){
            this._target.dispose();
        }

        public addWrapTarget(wrapTarget:IObserver){
            this._wrapTargetList.addChild(wrapTarget);
        }

        private _execWrapTarget(func){
            this._wrapTargetList.getCount() > 0 && this._wrapTargetList.forEach(func);
        }
    }
}
