describe("concatMap", function () {
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


    it("Projects each element of an stream sequence to an stream sequence and concatenates the resulting stream sequences or Promises or array/iterable into one stream sequence.", function () {
        var scheduler = TestScheduler.create(true);
        var stream = rt.fromArray([1, 2])
            .concatMap(function(value){
                if(value === 1){
                    return rt.timeout(100, scheduler);
                }
                else{
                    return rt.interval(60, scheduler);
                }
            });
        var results = scheduler.startWithSubscribe(function () {
            return stream;
        });

        expect(results.messages).toStreamContain(
            next(300, 100), next(320, 1), next(380, 2)
        );
    });

    describe("compare concatMap and flatMap", function () {
        it("concatMap", function (done) {
            var result = [];

            rt.fromArray([1,2])
                .concatMap(function(){
                    return rt.timeout(20)
                        .flatMap(function(){
                            result.push(0);
                            return rt.timeout(20)
                                .do(function(){
                                    result.push(1);
                                })
                        })
                        .do(function(){
                            result.push(2);
                        })
                })
                .subscribe(function(){
                }, null, function(){
                    expect(result).toEqual([0,1,2, 0,1,2]);

                    done();
                });
        });
        it("flatMap", function (done) {
            var result = [];

            rt.fromArray([1,2])
                .flatMap(function(){
                    return rt.timeout(20)
                        .flatMap(function(){
                            result.push(0);
                            return rt.timeout(20)
                                .do(function(){
                                    result.push(1);
                                })
                        })
                        .do(function(){
                            result.push(2);
                        })
                })
                .subscribe(function(){
                }, null, function(){
                    expect(result).toEqual([0,0,1,2,1,2]);

                    done();
                });
        });
    });

    it("fix bug: if only one element, the stream should complete when this element complete", function () {
        var scheduler = TestScheduler.create(true);
        var stream = rt.fromArray([1])
            .concatMap(function(value){
                if(value === 1){
                    return rt.timeout(100, scheduler);
                }
            });
        var results = scheduler.startWithSubscribe(function () {
            return stream;
        });

        expect(results.messages).toStreamContain(
            next(300, 100) , completed(301)
        );
    });
});

