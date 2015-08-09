/// <reference path="../definitions.d.ts"/>
module dyRt{
	export class InnerSubscriptionGroup implements IDisposable{
		public static create() {
			var obj = new this();

			return obj;
		}

		private _container:dyCb.Collection<IDisposable> = dyCb.Collection.create<IDisposable>();

		public addChild(child:IDisposable){
			this._container.addChild(child);
		}

		public dispose(){
			this._container.forEach((child:IDisposable) => {
				child.dispose();
			});
		}
	}
}
