describe("filter", function () {
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

    describe("Filters the elements of an observable sequence based on a predicate", function () {
        it("complete", function () {
            var stream1 = scheduler.createStream(
                next(100, 1),
                next(200, 2),
                next(300, 3),
                completed(301)
            );

            var results = scheduler.startWithSubscribe(function () {
                return stream1.filter(function(value){
                    return value <= 2
                });
            }, 50);

            expect(results.messages).toStreamEqual(
                next(100, 1),
                next(200, 2),
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
                return stream1.filter(function(value){
                    return value >= 1;
                });
            }, 50);

            expect(results.messages).toStreamEqual(
                next(100, 1),
                error(200, e)
            );
        });
        it("error_after", function () {
            var e= {};
            var stream1 = scheduler.createStream(
                next(100, 1),
                error(200, e),
                next(300, 3),
                completed(301)
            );

            var results = scheduler.startWithSubscribe(function () {
                return stream1.filter(function(value){
                    return value >= 3;
                });
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
                return stream1.filter(function(value){
                    return value === 1;
                });
            }, 50, 210);

            expect(results.messages).toStreamEqual(
                next(100, 1)
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
                return stream1.filter(function(value){
                    return value === 3;
                });
            }, 50, 210);

            expect(results.messages).toStreamEqual(
            );
        });
        it("test multi filter", function(){
            var stream1 = scheduler.createStream(
                next(100, 1),
                next(200, 2),
                next(300, 3),
                completed(301)
            );

            var results = scheduler.startWithSubscribe(function () {
                return stream1.filter(function(value){
                    return value === 1 || value === 2;
                }).filter(function(value){
                    return value === 2;
                });
            }, 50);

            expect(results.messages).toStreamEqual(
                next(200, 2),
                completed(301)
            );
        });
    });
});
