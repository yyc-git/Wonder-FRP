describe("takeLast", function () {
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

    describe("Returns a specified number of contiguous elements from the end of an Stream sequence" +
        "This operator accumulates a buffer with a length enough to store elements count elements. Upon completion of the source sequence, this buffer is drained on the result sequence. This causes the elements to be delayed.", function () {
        it("complete_takeLast_one", function () {
            var stream1 = scheduler.createStream(
                next(100, 1),
                next(200, 2),
                next(300, 3),
                completed(310)
            );

            var results = scheduler.startWithSubscribe(function () {
                return stream1.takeLast();
            }, 50);

            expect(results.messages).toStreamEqual(
                next(310, 3),
                completed(310)
            );
        });
        it("complete_takeLast_before", function () {
            var stream1 = scheduler.createStream(
                next(100, 1),
                next(200, 2),
                next(300, 3),
                completed(301)
            );

            var results = scheduler.startWithSubscribe(function () {
                return stream1.takeLast(2);
            }, 50);

            expect(results.messages).toStreamEqual(
                next(301, 2),
                next(301, 3),
                completed(301)
            );
        });
        it("complete_takeLast_exceed", function () {
            var stream1 = scheduler.createStream(
                next(100, 1),
                next(200, 2),
                next(300, 3),
                completed(301)
            );

            var results = scheduler.startWithSubscribe(function () {
                return stream1.takeLast(10);
            }, 50);

            expect(results.messages).toStreamEqual(
                next(301, 1),
                next(301, 2),
                next(301, 3),
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
                return stream1.takeLast(1);
            }, 50);

            expect(results.messages).toStreamEqual(
                error(200, e)
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
                return stream1.takeLast(2);
            }, 50);

            expect(results.messages).toStreamEqual(
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
                return stream1.takeLast(10);
            }, 50);

            expect(results.messages).toStreamEqual(
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
                return stream1.takeLast(2);
            }, 50, 210);

            expect(results.messages).toStreamEqual(
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
                return stream1.takeLast(5);
            }, 50, 210);

            expect(results.messages).toStreamEqual(
            );
        });
    });

    it("if the stream is empty, it will trigger observer->completed", function () {
        var stream1 = scheduler.createStream(
            completed(310)
        );

        var results = scheduler.startWithSubscribe(function () {
            return stream1.takeLast()
        }, 50);

        expect(results.messages).toStreamEqual(
            completed(310)
        );
    });
});

