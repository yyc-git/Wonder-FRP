describe("do", function () {
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

    //it("FromPromise Success Mock", function () {
    //    var promise = scheduler.createResolvedPromise(201, 1);
    //
    //    var results = scheduler.startWithSubscribe(function () {
    //        return rt.fromPromise(promise);
    //    });
    //
    //    expect(results.messages).toStreamEqual(
    //        next(201, 1),
    //        completed(201)
    //    );
    //});

    //test("FromPromise Failure Mock", function () {
    //    //var error = new Error();
    //    //
    //    //var scheduler = new TestScheduler();
    //    //
    //    //var xs = scheduler.createRejectedPromise(201, error);
    //    //
    //    //var results = scheduler.startWithCreate(function () {
    //    //    return Observable.fromPromise(xs);
    //    //});
    //    //
    //    //results.messages.assertEqual(
    //    //    onError(201, error)
    //    //);
    //});

    it("Promise Success", function (done) {
        var a = 0,
            b = 0;
        var promise = new RSVP.Promise(function (resolve, reject) {
            resolve(42);
        });

        var source = rt.fromPromise(promise);

        var subscription = source.subscribe(
            function (x) {
                a = x;
                expect(a).toEqual(42);
            },
            function (err) {
            },
            function () {
                b = true;
                done();
                expect(b).toBeTruthy();
            });
    });
    it("Promise Fail", function (done) {
        var a = 0,
            b = 0;
        var error = new Error("woops");
        var promise = new RSVP.Promise(function (resolve, reject) {
            reject(error);
        });

        var source = rt.fromPromise(promise);

        var subscription = source.subscribe(
            function (x) {
            },
            function (err) {
                done();
                expect(error).toEqual(err);
            },
            function () {
            });
    });
    //
    //asyncTest("Promise_Failure", function () {
    //    var error = new Error("woops");
    //
    //    var promise = new RSVP.Promise(function (resolve, reject) {
    //        reject(error);
    //    });
    //
    //    var source = Observable.fromPromise(promise);
    //
    //    var subscription = source.subscribe(
    //        function (x) {
    //            ok(false);
    //        },
    //        function (err) {
    //            strictEqual(err, error);
    //            start();
    //        },
    //        function () {
    //            ok(false);
    //        });
    //
    //});
});

