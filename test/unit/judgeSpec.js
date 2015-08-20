describe("judge", function () {
    var rt = dyRt,
        TestScheduler = rt.TestScheduler,
        next = TestScheduler.next,
        error = TestScheduler.error,
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

    it("if condition return true, return source1, else return source2", function(){
        var result = [];

        rt.judge(function(){
            return true;
        }, rt.fromArray([1]),
        rt.fromArray([2]))
            .subscribe(function(data){
                result.push(data);
            });

        expect(result).toEqual([1]);

        result = [];
        rt.judge(function(){
                return false;
            }, rt.fromArray([1]),
            rt.fromArray([2]))
            .subscribe(function(data){
                result.push(data);
            });

        expect(result).toEqual([2]);
    });
});

