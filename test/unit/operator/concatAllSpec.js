describe("concatAll", function () {
    var rt = wdFrp,
        TestScheduler = rt.TestScheduler,
        next = TestScheduler.next,
        error = TestScheduler.error,
        completed = TestScheduler.completed;
    var scheduler = null;
    var sandbox = null;
    var result = null;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        scheduler = TestScheduler.create();
        result = [];
    });
    afterEach(function () {
        sandbox.restore();
    });

    it("concat all streams", function(){
        var scheduler = TestScheduler.create(true);
        var stream = rt.fromArray([1, 2])
            .map(function(value){
                if(value === 1){
                    return rt.timeout(100, scheduler);
                }
                else{
                    return rt.interval(60, scheduler);
                }
            })
            .concatAll();
        var results = scheduler.startWithSubscribe(function () {
            return stream;
        });

        expect(results.messages).toStreamContain(
            next(300, 100), next(320, 1), next(380, 2)
        );
    });
});
