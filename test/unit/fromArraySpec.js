describe("fromArray", function(){
    var rt = dyRt,
        TestScheduler = rt.TestScheduler,
        next = TestScheduler.next,
        completed = TestScheduler.completed;
    var scheduler = null;
    var sandbox = null;

    beforeEach(function(){
        sandbox = sinon.sandbox.create();
        scheduler = new TestScheduler();
    });
    afterEach(function(){
        sandbox.restore();
    });

    describe("create stream from array", function(){
        it("from finite array", function(){
            var array = [1,2,3];

            var results = scheduler.startWithSubscribe(function () {
                return rt.fromArray(array, scheduler);
            });

            expect(results.messages).toStreamEqual(
                    next(200, 1),
                    next(201, 2),
                    next(202, 3),
                    completed(203)
            );
        });
        it("from empty array", function(){
            var array = [];

            var results = scheduler.startWithSubscribe(function () {
                return rt.fromArray(array, scheduler);
            });

            expect(results.messages).toStreamEqual(
                completed(200)
            );
        });
    });
});
