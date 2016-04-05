describe("timeout", function () {
    var rt = wdFrp,
        TestScheduler = rt.TestScheduler,
        next = TestScheduler.next,
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

    it("if time < 0, contract error", function () {
        testTool.openContractCheck(sandbox);

        expect(function(){
            rt.timeout(-1);
        }).toThrow();
    });


    it("next and completed when timeout time reached", function () {
        var results;

        results = scheduler.startWithSubscribe(function () {
            return rt.timeout(400, scheduler);
        });

        expect(results.messages).toStreamContain(
            next(600, 400), completed(601)
        );
    });
});
