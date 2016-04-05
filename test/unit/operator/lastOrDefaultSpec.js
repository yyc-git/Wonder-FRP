describe("lastOrDefault", function () {
    var rt = wdFrp,
        TestScheduler = rt.TestScheduler,
        next = TestScheduler.next,
        error = TestScheduler.error,
        completed = TestScheduler.completed;
    var scheduler = null;
    var sandbox = null;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        scheduler = TestScheduler.create();

        testTool.openContractCheck(sandbox);
    });
    afterEach(function () {
        sandbox.restore();
    });

    it("return the last element", function () {
        var stream1 = scheduler.createStream(
            next(100, 1),
            next(200, 2),
            next(300, 3),
            completed(310)
        );

        var results = scheduler.startWithSubscribe(function () {
            return stream1.lastOrDefault();
        }, 50);

        expect(results.messages).toStreamEqual(
            next(310, 3),
            completed(310)
        );
    });
    it("if the stream is empty, it will trigger observer->next with default value once", function () {
        var stream1 = scheduler.createStream(
            completed(310)
        );

        var results = scheduler.startWithSubscribe(function () {
            return stream1.lastOrDefault("aaa");
        }, 50);

        expect(results.messages).toStreamEqual(
            next(310, "aaa"),
            completed(310)
        );
    });
    it("the default value is null default", function () {
        var stream1 = scheduler.createStream(
            completed(310)
        );

        var results = scheduler.startWithSubscribe(function () {
            return stream1.lastOrDefault();
        }, 50);

        expect(results.messages).toStreamEqual(
            next(310, null),
            completed(310)
        );
    });
});

