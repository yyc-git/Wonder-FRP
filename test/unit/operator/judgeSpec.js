describe("judge", function () {
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
    });
    afterEach(function () {
        sandbox.restore();
    });

    it("if condition return true, return source1, else return source2", function(){
        var result = [];
        sandbox.spy(rt, "fromArray");

        rt.judge(function(){
            return true;
        }, function(){
            return rt.fromArray([1])
            }, function(){
                return rt.fromArray([2])
            })
            .subscribe(function(data){
                result.push(data);
            });

        expect(result).toEqual([1]);
        expect(rt.fromArray).toCalledOnce();

        result = [];
        rt.judge(function(){
                return false;
        }, function(){
            return rt.fromArray([1])
        }, function(){
            return rt.fromArray([2])
        })
            .subscribe(function(data){
                result.push(data);
            });

        expect(result).toEqual([2]);
    });
});

