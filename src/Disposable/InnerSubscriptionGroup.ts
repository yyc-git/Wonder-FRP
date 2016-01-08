module wdFrp{
	export class InnerSubscriptionGroup implements IDisposable{
		public static create() {
			var obj = new this();

			return obj;
		}

		private _container:wdCb.Collection<IDisposable> = wdCb.Collection.create<IDisposable>();

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
