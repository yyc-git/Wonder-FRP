describe("defer", function () {
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

    it("invoke buildStreamFunc when observer->next", function(){
        var a = 0;
        var result = [];

        var stream = rt.fromArray([1])
            .do(function(){
                a++;
            }, null, null)
            .concat(
                rt.defer(function(){
                    return rt.judge(function(){
                        return a > 0;
                    }, function(){
                        return rt.fromArray([2])
                    }, function(){
                        return rt.fromArray([3])
                    })
                })
            );

        stream.subscribe(function(data){
            result.push(data);
        }, null, function(){
            result.push(-1);
        });

        expect(result).toEqual(
            [1, 2, -1]
        );
    });
});

