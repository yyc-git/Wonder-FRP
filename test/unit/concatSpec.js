describe("concat", function () {
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

    it("concat", function(){
        var stream = rt.fromArray([1, 2])
            .concat(rt.fromArray([3, 4]));

        stream.subscribe(function(data){
            result.push(data);
        }, null, function(){
            result.push(-1);
        });

        expect(result).toEqual([1, 2, 3, 4, -1]);
    });
    it("concat array", function(){
        var stream = rt.fromArray([1, 2])
            .concat(rt.fromArray([3, 4]))
            .map(function(value){
                return value * 2;
            });

        stream.subscribe(function(data){
            result.push(data);
        });

        expect(result).toEqual([ 2,4,6,8 ]);
    });
    it("concat promise", function(done){
        var promiseSuc1 = new RSVP.Promise(function (resolve, reject) {
            resolve(1);
        });
        var promiseSuc2 = new RSVP.Promise(function (resolve, reject) {
            resolve(2);
        });
        var promiseSuc3 = new RSVP.Promise(function (resolve, reject) {
            resolve(3);
        });
        var error = new Error("woops");
        var promiseErr = new RSVP.Promise(function (resolve, reject) {
            reject(error);
        });
        var errResult = [];

        var stream = rt.fromPromise(promiseSuc1)
            .concat([promiseSuc2, promiseErr, promiseSuc3])
            .do(function(value){
                result.push(value*2);
            }, function(err){
                errResult.push(err);
            });

        stream.subscribe(function(data){
            result.push(data);
        }, function(err){
            errResult.push(err);

            expect(result).toEqual([2, 1, 4, 2]);
            expect(errResult).toEqual([error, error]);

            done();
        });
    });
    it("multi operator", function(){
        var promiseSuc1 = scheduler.createResolvedPromise(210, 1);

        var results = scheduler.startWithSubscribe(function () {
            return rt.fromPromise(promiseSuc1, scheduler)
                .map(function(value){
                    return value*2;
                })
                .concat(rt.fromArray([10, 20]), rt.interval(100, scheduler))
                .do(function(value){
                    result.push(value*2);
                }, function(err){
                });
        });

        expect(results.messages).toStreamContain(
            next(210, 2), next(211, 10), next(211, 20), next(311, 0), next(411, 1)
        );
    });

    describe("multi concat", function(){
        it("test1", function(){
            var stream = rt.fromArray([1, 2])
                .concat(rt.fromArray([3, 4]))
                .concat(rt.fromArray([5]))
                .map(function(value){
                    return value * 2;
                });

            stream.subscribe(function(data){
                result.push(data);
            });

            expect(result).toEqual([2, 4, 6, 8, 10]);
        });
        it("test2", function(){
            var stream = rt.fromArray([1, 2])
                .concat(rt.fromArray([3]).concat(rt.fromArray([4])))
                .concat(rt.fromArray([5]))
                .map(function(value){
                    return value * 2;
                });

            stream.subscribe(function(data){
                result.push(data);
            }, null, function(){
                result.push(-1);
            });

            expect(result).toEqual([2, 4, 6, 8, 10, -1]);
        });
    });
});

