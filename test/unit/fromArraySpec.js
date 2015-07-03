describe("fromArray", function(){
    var rt = dyRt,
        TestScheduler = rt.TestScheduler,
        next = TestScheduler.next,
        completed = TestScheduler.completed;
    var sandbox = null;

    beforeEach(function(){
        sandbox = sinon.sandbox.create();
    });
    afterEach(function(){
        sandbox.restore();
    });

    describe("create stream from array", function(){
        it("test", function(){
            var array = [1,2,3];

            var scheduler = new TestScheduler();

            var results = scheduler.startWithCreate(function () {
                return rt.fromArray(array);
            });

            expect(results.messages).toStreamEqual(
                    next(200, 1),
                    next(201, 2),
                    next(202, 3),
                    completed(203)
            );
        });
    });
});
