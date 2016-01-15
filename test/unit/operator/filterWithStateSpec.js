describe("filterWithState", function () {
    var rt = wdFrp,
        TestScheduler = rt.TestScheduler,
        next = TestScheduler.next,
        error = TestScheduler.error,
        completed = TestScheduler.completed;
    var State = rt.FilterState;
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

    describe("Filters the elements of an observable sequence based on a predicate." +
        "it will pass filter state to next() to mark whether it's enter or leave state, This will cause invoke next() one time more that it need to know whether it's leave state.", function () {
        it("invoke next() one time more", function () {
            var results = [];

            rt.fromArray([1, 2, 3])
                .filterWithState(function(value){
                    return value <= 2;
                })
                .subscribe(function(data){
                    results.push(data);
                });

            expect(results[0]).toEqual({value:1, state:State.ENTER});
            expect(results[1]).toEqual({value:2, state:State.TRIGGER});
            expect(results[2]).toEqual({value:3, state:State.LEAVE});
        });
        it("test multi filterWithState", function(){
            var stream1 = scheduler.createStream(
                next(100, 1),
                next(200, 2),
                next(300, 3),
                completed(301)
            );

            var results = scheduler.startWithSubscribe(function () {
                return stream1.filterWithState(function(value){
                        return value === 1 || value === 2;
                    })
                    .filterWithState(function(value){
                        return value === 2;
                    });
            }, 50);

            expect(results.messages).toStreamEqual(
                next(200, {value:2, state:State.ENTER}),
                next(300, {value:3, state:State.LEAVE}),
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
                return stream1.filterWithState(function(value){
                    return value >= 1;
                });
            }, 50);

            expect(results.messages).toStreamEqual(
                next(100, {value:1, state:State.ENTER}),
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
                return stream1.filterWithState(function(value){
                    return value >= 3
                });
            }, 50);

            expect(results.messages).toStreamEqual(
                error(200, e)
            );
        });
        it("error_after_2", function () {
            var e= {};
            var stream1 = scheduler.createStream(
                next(100, 1),
                error(200, e),
                next(300, 3),
                completed(301)
            );

            var results = scheduler.startWithSubscribe(function () {
                return stream1.filterWithState(function(value){
                    return value <= 3;
                });
            }, 50);

            expect(results.messages).toStreamEqual(
                next(100, {value:1, state:State.ENTER}),
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
                return stream1.filterWithState(function(value){
                    return value <= 2;
                });
            }, 50, 210);

            expect(results.messages).toStreamEqual(
                next(100, {value:1, state:State.ENTER}),
                next(200, {value:2, state:State.TRIGGER})
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
                return stream1.filterWithState(function(value){
                    return value === 3;
                });
            }, 50, 210);

            expect(results.messages).toStreamEqual(
            );
        });
    });
});
