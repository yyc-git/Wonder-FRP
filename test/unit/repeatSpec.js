describe("repeat", function () {
    var rt = dyRt,
        TestScheduler = rt.TestScheduler,
        next = TestScheduler.next,
        error = TestScheduler.error,
        completed = TestScheduler.completed;
    var scheduler = null;
    var sandbox = null;
    var result = null;

    function subscribe(subject) {
        subscription = subject.subscribe(function (data) {
            result.push(data);
        }, function (err) {
            result.push(err);
        }, function () {
            result.push(-1);
        });
    }

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        scheduler = TestScheduler.create();
        result = [];
    });
    afterEach(function () {
        sandbox.restore();
    });

    it("repeat zero will completed immediately", function(){
        var stream = rt.fromArray([1])
            .repeat(0);

        subscribe(stream);

        expect(result).toEqual([-1]);
    });
    it("test repeat finite count", function(){
        var stream = rt.fromArray([1, 2])
            .repeat(2);

        subscribe(stream);

        expect(result).toEqual([1, 2, 1, 2, -1]);
    });
    it("test repeat infinite count", function(){
        //todo how to test? modifu TestScheduler->publishRecursive to limit max count(10)?
    });
    it("test dispose", function(){
        //todo should use TestScheduler->createStream?
        //test('Repeat_Observable_RepeatCount_Dispose', function () {
        //    var scheduler = new TestScheduler();
        //
        //    var xs = scheduler.createColdObservable(
        //        onNext(5, 1),
        //        onNext(10, 2),
        //        onNext(15, 3),
        //        onCompleted(20));
        //
        //    var results = scheduler.startWithDispose(function () {
        //        return xs.repeat(3);
        //    }, 231);
        //
        //    results.messages.assertEqual(
        //        onNext(205, 1),
        //        onNext(210, 2),
        //        onNext(215, 3),
        //        onNext(225, 1),
        //        onNext(230, 2));
        //
        //    xs.subscriptions.assertEqual(
        //        subscribe(200, 220),
        //        subscribe(220, 231));
        //});
    });

    it("multi operator", function(){
        //todo concat, merge
        //todo do,map,takeUntil
        var stream = rt.fromArray([1, 2])
            .concat(rt.fromArray([3]))
            .merge(rt.fromArray([4]))
            .map(function(x){
                return x * 2;
            })
            .repeat(2)
        .map(function(x){
            return x * 2;
        });

        subscribe(stream);

        expect(result).toEqual([ 4, 8, 12, 16, 4, 8, 12, 16, -1]);
    });
});

