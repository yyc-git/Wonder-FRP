describe("takeWhile", function () {
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

    describe("Returns elements from an observable sequence as long as a specified condition is true.", function () {
        it("complete_takeWhile_before", function () {
            var stream1 = scheduler.createStream(
                next(100, 1),
                next(200, 2),
                next(300, 3),
                completed(301)
            );

            var results = scheduler.startWithSubscribe(function () {
                return stream1.takeWhile(function(value){
                    return value <=2;
                });
            }, 50);

            expect(results.messages).toStreamEqual(
                next(100, 1),
                next(200, 2),
                completed(300)
            );
        });
        it("complete_takeWhile_exceed", function () {
            var stream1 = scheduler.createStream(
                next(100, 1),
                next(200, 2),
                next(300, 3),
                completed(301)
            );

            var results = scheduler.startWithSubscribe(function () {
                return stream1.takeWhile(function(value){
                    return value > 1;
                });
            }, 50);

            expect(results.messages).toStreamEqual(
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
                return stream1.takeWhile(function(value){
                    return value === 1;
                });
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
                return stream1.takeWhile(function(value){
                    return value >= 1;
                });
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
                return stream1.takeWhile(function(value){
                    return value <= 1;
                });
            }, 50, 210);

            expect(results.messages).toStreamEqual(
                next(100, 1),
                completed(200)
            );
        });
        it("dispose_same", function () {
            var stream1 = scheduler.createStream(
                next(100, 1),
                next(200, 2),
                next(300, 3),
                completed(301)
            );

            var results = scheduler.startWithTime(function () {
                return stream1.takeWhile(function(value){
                    return value <= 2;
                });
            }, 50, 210);

            expect(results.messages).toStreamEqual(
                next(100, 1),
                next(200, 2)
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
                return stream1.takeWhile(function(value){
                    return value > 1;
                });
            }, 50, 210);

            expect(results.messages).toStreamEqual(
                next(200, 2)
            );
        });
        it("takeWhile_zero", function () {
            var stream1 = scheduler.createStream(
                next(100, 1),
                next(200, 2),
                next(300, 3),
                completed(301)
            );

            var results = scheduler.startWithSubscribe(function () {
                return stream1.takeWhile(function(value){
                    return value === 0;
                });
            }, 50);

            expect(results.messages).toStreamEqual(
                completed(301)
            );
        });
        it("takeWhile_throw", function () {
            var e = {};
            var stream1 = scheduler.createStream(
                next(100, 1),
                next(200, 2),
                next(300, 3),
                completed(301)
            );

            var results = scheduler.startWithSubscribe(function () {
                return stream1.takeWhile(function(value){
                    if(value === 2){
                        throw e;
                    }
                    return value > 0;
                });
            }, 50);

            expect(results.messages).toStreamEqual(
                next(100, 1),
                error(200, e)
            );
        });
        it("takeWhile_index", function () {
            var e = {};
            var stream1 = scheduler.createStream(
                next(100, 1),
                next(200, 2),
                next(300, 3),
                completed(301)
            );

            var results = scheduler.startWithSubscribe(function () {
                return stream1.takeWhile(function(value, index, source){
                    return index <= 0;
                });
            }, 50);

            expect(results.messages).toStreamEqual(
                next(100, 1),
                completed(200)
            );
        });
    });
});

