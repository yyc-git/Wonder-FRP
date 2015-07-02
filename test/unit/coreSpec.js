describe("core", function () {
    var rt = dyRt;
    var sandbox = null;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });
    afterEach(function () {
        sandbox.restore();
    });

    describe("create stream", function () {
        it("test next and completed", function () {
            var a = 0;
            var source = rt.Stream.create(function (observer) {
                observer.next(10);
                observer.next(20);
                observer.completed();
            });

            var subscription = source.subscribe(
                function (x) {
                    a += x;
                },
                function (e) {
                },
                function () {
                    expect(a).toEqual(30);
                });
        });

        describe("dispose", function(){
            describe("the default behavior of the Observable operators is to dispose of the subscription as soon as possible " +
                "(i.e, when an completed or error messages is published)", function(){
                it("publish error", function(){
                    var b = 0;
                    var source = rt.Stream.create(function (observer) {
                        observer.error();

                        // Any cleanup logic might go here
                        return function () {
                            b = 1;
                        }
                    });

                    var subscription = source.subscribe(
                        function (x) {
                        },
                        function (e) {
                            expect(b).toEqual(0);
                        },
                        function () {
                        }
                    );

                    expect(b).toEqual(1);
                    expect(subscription.isDisposed).toBeTruthy();
                });
                it("publish completed", function () {
                    var b = 0;
                    var source = rt.Stream.create(function (observer) {
                        observer.completed();

                        // Any cleanup logic might go here
                        return function () {
                            b = 1;
                        }
                    });

                    var subscription = source.subscribe(
                        function (x) {
                        },
                        function (e) {
                        },
                        function () {
                            expect(b).toEqual(0);
                        }
                    );

                    expect(b).toEqual(1);
                    expect(subscription.isDisposed).toBeTruthy();
                });
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
            var errorMsg = "error occur";
            var a = 0;
            var source = rt.Stream.create(function (observer) {
                observer.next(1);
                observer.error(errorMsg);
                observer.next(2);
                observer.completed();
            });

            var subscription = source.subscribe(
                function (x) {
                    a += x;
                },
                function (e) {
                    expect(e).toEqual(errorMsg);
                },
                //not invoke
                function () {
                }
            );

            expect(a).toEqual(1);
        });
        it("stream.endOnError can terminate the stream", function () {
            //todo
        });
    });
});

