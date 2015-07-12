describe("core", function () {
    var rt = dyRt,
        TestScheduler = rt.TestScheduler,
        next = TestScheduler.next,
        completed = TestScheduler.completed;
    var scheduler = null;
    var sandbox = null;

    beforeEach(function(){
        sandbox = sinon.sandbox.create();
        scheduler = TestScheduler.create();
    });
    afterEach(function(){
        sandbox.restore();
    });

    describe("create stream", function () {
        it("test next and completed", function () {
            var a = 0;
            var stream = rt.createStream(function (observer) {
                observer.next(10);
                observer.next(20);
                observer.completed();
            });

            var subscription = stream.subscribe(
                function (x) {
                    a += x;
                },
                function (e) {
                },
                function () {
                    expect(a).toEqual(30);
                });
        });



//        var scheduler = new rt.TestScheduler();
//
//// Create hot observable which will start firing
////        var xs = scheduler.createHotStream(
//        var xs = scheduler.createStream(
//            next(0, 42),
//            //next(210, 2),
//            //next(220, 3),
//            completed(0)
//        );
//
//// Note we'll start at 200 for subscribe, hence missing the 150 mark
//        var res = scheduler.startWithCreate(function () {
//            return xs;
//        });
//
//        expect(res.messages).toEqual([
//            next(0, 42),
//            onComplete(0)
//        ]);
//        // Check for subscribe/unsubscribe
//        expect(xs.subscriptions).toEqual([
//            subscribe(0, 0)
//        ]);

    });

    describe("the Error event does not terminate a stream. So, a stream may contain multiple errors.", function () {
        it("error shouldn't terminate a stream", function () {
            //todo need more think

            //var errorMsg = "error occur";
            //var a = 0;
            //var stream = rt.createStream(function (observer) {
            //    observer.next(1);
            //    observer.error(errorMsg);
            //    observer.next(2);
            //    observer.completed();
            //});
            //
            //var subscription = stream.subscribe(
            //    function (x) {
            //        a += x;
            //    },
            //    function (e) {
            //        expect(e).toEqual(errorMsg);
            //    },
            //    //not invoke
            //    function () {
            //    }
            //);
            //
            //expect(a).toEqual(3);
        });
        it("stream.endOnError can terminate the stream", function () {
            //todo
        });
    });


    //todo hot
});

