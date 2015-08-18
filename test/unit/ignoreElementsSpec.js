describe("map", function () {
    var rt = dyRt,
        TestScheduler = rt.TestScheduler,
        next = TestScheduler.next,
        error = TestScheduler.error,
        completed = TestScheduler.completed;
    var scheduler = null;
    var sandbox = null;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        scheduler = TestScheduler.create();
    });
    afterEach(function () {
        sandbox.restore();
    });

    it("Ignores all elements that the observer's next will do nothing in the stream while the observer's completed still work normally when completed", function(){
        var stream = scheduler.createStream(
            next(210, 1),
            next(220, 2),
            completed(230)
        );
        var results = scheduler.startWithSubscribe(function () {
            return stream.ignoreElements();
        });

        expect(results.messages).toStreamEqual(completed(230));
    });
    it("observer's error still work normally when error occur", function(){
        var stream = scheduler.createStream(
            next(210, 1),
            error(220, "err"),
            completed(230)
        );
        var results = scheduler.startWithSubscribe(function () {
            return stream.ignoreElements();
        });

        expect(results.messages).toStreamEqual(
            error(220, "err")
        );
    });
    it("multi operator", function(){
        var result = [];
        var subscribeResult = [];

        rt.createStream(function(observer){
            observer.next(1);
            observer.next(2);
            observer.completed();
        })
            .merge(rt.fromArray([10, 20, 30]))
            .do(function(data){
                result.push(data);
            })
            .ignoreElements()
            .concat(rt.fromArray([1]))
            .subscribe(function(data){
                subscribeResult.push(data);
            });

        expect(result).toEqual([1, 2, 10, 20, 30]);
        expect(subscribeResult).toEqual([1])
    });
});
