describe("take", function () {
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

    describe("Returns a specified number of contiguous elements from the start of an observable sequence", function () {
        it("if count < 0, contract error", function(){
            var stream1 = scheduler.createStream(
                next(100, 1),
                next(200, 2),
                next(300, 3),
                completed(301)
            );
            expect(function(){
                stream1.take(-1);
            }).toThrow();
        });
        it("complete_take_one", function () {
            var stream1 = scheduler.createStream(
                next(100, 1),
                next(200, 2),
                next(300, 3),
                completed(301)
            );

            var results = scheduler.startWithSubscribe(function () {
                return stream1.take();
            }, 50);

            expect(results.messages).toStreamEqual(
                next(100, 1),
                completed(100)
            );
        });
        it("complete_take_before", function () {
            var stream1 = scheduler.createStream(
                next(100, 1),
                next(200, 2),
                next(300, 3),
                completed(301)
            );

            var results = scheduler.startWithSubscribe(function () {
                return stream1.take(2);
            }, 50);

            expect(results.messages).toStreamEqual(
                next(100, 1),
                next(200, 2),
                completed(200)
            );
        });
        it("complete_take_exceed", function () {
            var stream1 = scheduler.createStream(
                next(100, 1),
                next(200, 2),
                next(300, 3),
                completed(301)
            );

            var results = scheduler.startWithSubscribe(function () {
                return stream1.take(10);
            }, 50);

            expect(results.messages).toStreamEqual(
                next(100, 1),
                next(200, 2),
                next(300, 3),
                completed(301)
            );
        });
        it("error_before", function () {
            var e= {};
            var stream1 = scheduler.createStream(
                next(100, 1),
                error(200, e),
                next(300, 3),
                completed(301)
            );

            var results = scheduler.startWithSubscribe(function () {
                return stream1.take(1);
            }, 50);

            expect(results.messages).toStreamEqual(
                next(100, 1),
                completed(100)
            );
        });
        it("error_same", function () {
            var e= {};
            var stream1 = scheduler.createStream(
                next(100, 1),
                error(200, e),
                next(300, 3),
                completed(301)
            );

            var results = scheduler.startWithSubscribe(function () {
                return stream1.take(2);
            }, 50);

            expect(results.messages).toStreamEqual(
                next(100, 1),
                error(200, e)
            );
        });
        it("error_exceed", function () {
            var e= {};
            var stream1 = scheduler.createStream(
                next(100, 1),
                error(200, e),
                next(300, 3),
                completed(301)
            );

            var results = scheduler.startWithSubscribe(function () {
                return stream1.take(10);
            }, 50);

            expect(results.messages).toStreamEqual(
                next(100, 1),
                error(200, e)
            );
        });
        it("dispose_before", function () {
            var stream1 = scheduler.createStream(
                next(100, 1),
                next(200, 2),
                next(300, 3),
                completed(301)
            );

            var results = scheduler.startWithTime(function () {
                return stream1.take(2);
            }, 50, 210);

            expect(results.messages).toStreamEqual(
                next(100, 1),
                next(200, 2),
                completed(200)
            );
        });
        it("dispose_after", function () {
            var stream1 = scheduler.createStream(
                next(100, 1),
                next(200, 2),
                next(300, 3),
                completed(301)
            );

            var results = scheduler.startWithTime(function () {
                return stream1.take(5);
            }, 50, 210);

            expect(results.messages).toStreamEqual(
                next(100, 1),
                next(200, 2)
            );
        });
    });
});

