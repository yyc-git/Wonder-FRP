describe("empty", function () {
    var rt = dyRt,
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

    it("return empty stream", function(done){
        var result = 0;

        rt.empty(scheduler).subscribe(function(data){
            result = 1;
        }, null, function(){
            expect(result).toEqual(0);

            done();
        });
    });
});

