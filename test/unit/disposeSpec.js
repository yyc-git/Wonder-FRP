describe("dispose", function () {
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

    describe("test dispose when using subject", function () {
        describe("test TestScheduler->createStream", function () {
            it("test subject.dispose", function () {
                var c = 0;
                var stream = scheduler.createStream(
                    next(100, 1),
                    next(152, 2),
                    next(200, 3),
                    next(201, 4),
                    next(205, 5),
                    next(206, 6),
                    next(250, 7),
                    next(300, 8),
                    completed(301)
                );
                var subject = null;
                var result1 = scheduler.createObserver();
                var result2 = scheduler.createObserver();
                var subscription1 = null,
                    subscription2 = null;

                scheduler.publicAbsolute(100, function () {
                    subject = rt.Subject.create();
                });
                scheduler.publicAbsolute(150, function () {
                    stream.subscribe(subject);
                });
                scheduler.publicAbsolute(200, function () {
                    subscription1 = subject.subscribe(result1);
                });
                scheduler.publicAbsolute(202, function () {
                    subscription2 = subject.subscribe(result2);
                });
                scheduler.publicAbsolute(151, function () {
                    subject.start();
                });
                scheduler.publicAbsolute(206, function () {
                    subject.dispose();
                });
                scheduler.start();

                expect(result1.messages).toStreamEqual(
                    next(200, 3),
                    next(201, 4),
                    next(205, 5)
                );
                expect(result2.messages).toStreamEqual(
                    next(205, 5)
                );
            });
        });

        describe("test stream's operator which add disposeHandler", function () {
            it("interval", function () {
                sandbox.stub(rt.root, "clearInterval");
                var stream = rt.interval(100, scheduler)
                    .do(function(value){
                    });

                var subject = null;
                var result = scheduler.createObserver();
                var subscription = null;

                scheduler.publicAbsolute(100, function () {
                    subject = rt.Subject.create();
                });
                scheduler.publicAbsolute(150, function () {
                    stream.subscribe(subject);
                });
                scheduler.publicAbsolute(200, function () {
                    subscription = subject.subscribe(result);
                });
                scheduler.publicAbsolute(400, function () {
                    subscription.dispose();
                });
                scheduler.publicAbsolute(250, function () {
                    subject.start();
                });
                scheduler.start();

                expect(result.messages).toStreamEqual(
                    next(350, 0)
                );
                expect(rt.root.clearInterval).toCalledOnce();
            });
            it("intervalRequest", function () {
                sandbox.stub(rt.root, "cancelNextRequestAnimationFrame");
                var stream = rt.intervalRequest(scheduler)
                    .do(function(value){
                    });

                var subject = null;
                var result = scheduler.createObserver();
                var subscription = null;

                scheduler.publicAbsolute(100, function () {
                    subject = rt.Subject.create();
                });
                scheduler.publicAbsolute(150, function () {
                    stream.subscribe(subject);
                });
                scheduler.publicAbsolute(200, function () {
                    subscription = subject.subscribe(result);
                });
                scheduler.publicAbsolute(450, function () {
                    subscription.dispose();
                });
                scheduler.publicAbsolute(250, function () {
                    subject.start();
                });
                scheduler.start();

                expect(result.messages).toStreamEqual(
                    next(350, 0)
                );
                expect(rt.root.cancelNextRequestAnimationFrame).toCalledOnce();
            });
            it("timeout", function () {
                sandbox.stub(rt.root, "clearTimeout");
                var stream = rt.timeout(200, scheduler)
                    .do(function(value){
                    });

                var result = scheduler.createObserver();
                var subscription = null;

                scheduler.publicAbsolute(100, function () {
                    subscription = stream.subscribe(result);
                });
                scheduler.publicAbsolute(400, function () {
                    subscription.dispose();
                });

                scheduler.start();

                expect(rt.root.clearTimeout).toCalledOnce();
            });
            it("defer", function(){
                sandbox.stub(rt.root, "clearInterval");
                var stream = rt.defer(function(){
                    return rt.interval(100, scheduler);
                })


                var subject = null;
                var result = scheduler.createObserver();
                var subscription = null;

                scheduler.publicAbsolute(100, function () {
                    subject = rt.Subject.create();
                });
                scheduler.publicAbsolute(150, function () {
                    stream.subscribe(subject);
                });
                scheduler.publicAbsolute(200, function () {
                    subscription = subject.subscribe(result);
                });
                scheduler.publicAbsolute(400, function () {
                    subscription.dispose();
                });
                scheduler.publicAbsolute(250, function () {
                    subject.start();
                });
                scheduler.start();

                expect(result.messages).toStreamEqual(
                    next(350, 0)
                );
                expect(rt.root.clearInterval).toCalledOnce();

                //var promise = scheduler.createResolvedPromise(250, 1);
                //var stream = rt.fromPromise(promise, scheduler)
                //    .concat(rt.intervalRequest(scheduler));
                //
                //var results = scheduler.startWithTime(function () {
                //    return stream;
                //}, 150, 500);
                //
                //expect(rt.root.cancelNextRequestAnimationFrame).toCalledOnce();
                //
                //expect(results.messages).toStreamEqual(
                //    next(250, 1), next(350, 1), next(450, 2)
                //);
            });
            it("test subject dispose", function () {
                sandbox.stub(rt.root, "cancelNextRequestAnimationFrame");
                var stream = rt.intervalRequest(scheduler)
                    .do(function(value){
                    });

                var subject = null;
                var result1 = scheduler.createObserver();
                var result2 = scheduler.createObserver();
                var subscription1 = null;
                var subscription2 = null;

                scheduler.publicAbsolute(100, function () {
                    subject = rt.Subject.create();
                });
                scheduler.publicAbsolute(150, function () {
                    stream.subscribe(subject);
                });
                scheduler.publicAbsolute(200, function () {
                    subscription1 = subject.subscribe(result1);
                });
                scheduler.publicAbsolute(400, function () {
                    subscription2 = subject.subscribe(result2);
                });
                scheduler.publicAbsolute(500, function () {
                    subject.dispose();
                });
                scheduler.publicAbsolute(250, function () {
                    subject.start();
                });
                scheduler.start();

                expect(result1.messages).toStreamEqual(
                    next(350, 0), next(450, 1)
                );
                expect(result2.messages).toStreamEqual(
                    next(450, 1)
                );
                // expect(rt.root.cancelNextRequestAnimationFrame).toCalledTwice();
                expect(rt.root.cancelNextRequestAnimationFrame).toCalledOnce();
            });
        });
    });

    describe("test dispose when not using subject", function () {
        describe("the default behavior of the stream operators is to dispose of the subscription as soon as possible " +
            "dipose when an completed or error messages is published", function () {
            it("when publish error", function () {
                var a = 0;

                var stream = rt.createStream(function (observer) {
                    observer.error();
                });

                var subscription = stream.subscribe(
                    function (x) {
                    },
                    function (e) {
                        a = 10;
                    },
                    function () {
                        expect().toFail();
                    }
                );

                expect(a).toEqual(10);
                expect(subscription.isDisposed).toBeTruthy();
            });
            it("dipose when publish completed", function () {
                var b = 0;

                var stream = rt.createStream(function (observer) {
                    observer.completed();
                });

                var subscription = stream.subscribe(
                    function (x) {
                    },
                    function (e) {
                        expect().toFail();
                    },
                    function () {
                        expect(b).toEqual(0);
                    }
                );

                expect(subscription.isDisposed).toBeTruthy();
            });

        });

        it("if createStream->subscribeFunc->observer.error/completed is async, the returned func of subscribeFunc will be invoked when dispose;else it will not", function(done){
            var a = 0;
            var isDispose = false;

            var stream = rt.createStream(function (observer) {
                observer.error();

                return function(){
                    isDispose = true;
                }
            });

            var subscription = stream.subscribe(
                function (x) {
                },
                function (e) {
                    a = 10;

                    expect(isDispose).toBeFalsy();
                },
                function () {
                    expect().toFail();
                }
            );

            expect(a).toEqual(10);
            expect(subscription.isDisposed).toBeTruthy();
            expect(isDispose).toBeFalsy();



            var stream = rt.createStream(function (observer) {
                setTimeout(function(){
                    observer.error();
                }, 20);

                return function(){
                    expect(subscription.isDisposed).toBeTruthy();
                    done();
                }
            });

            var subscription = stream.subscribe(
                function (x) {
                },
                function (e) {
                    expect().toPass();
                },
                function () {
                    expect().toFail();
                }
            );

        });

        describe("test multi operator", function(){
            beforeEach(function(){
                sandbox.stub(rt.root, "cancelNextRequestAnimationFrame");
                sandbox.stub(rt.root, "clearInterval");
                sandbox.stub(rt.root, "clearTimeout");
                scheduler = TestScheduler.create(true);
            });

            it("concat", function(){
                var promise = scheduler.createResolvedPromise(250, 1);
                var stream = rt.fromPromise(promise, scheduler)
                    .concat(rt.intervalRequest(scheduler));

                var results = scheduler.startWithTime(function () {
                    return stream;
                }, 150, 500);

                expect(rt.root.cancelNextRequestAnimationFrame).toCalledOnce();

                expect(results.messages).toStreamEqual(
                    next(250, 1), next(350, 1), next(450, 2)
                );
            });

            describe("merge", function(){
                it("merge maxConcurrent", function(){
                    var stream = rt.fromArray([1, 2])
                        .map(function(value){
                            if(value === 1){
                                return rt.timeout(100, scheduler);
                            }
                            else{
                                return rt.interval(60, scheduler);
                            }
                        })
                        .merge(1);

                    var results = scheduler.startWithTime(function () {
                        return stream;
                    }, 150, 500);

                    expect(rt.root.clearTimeout).toCalledOnce();
                    expect(rt.root.clearInterval        ).toCalledOnce();
                });

                it("merge stream", function(){
                    var stream = rt.interval(80, scheduler)
                        .merge(rt.intervalRequest(scheduler));

                    var results = scheduler.startWithTime(function () {
                        return stream;
                    }, 150, 500);

                    expect(rt.root.cancelNextRequestAnimationFrame).toCalledOnce();
                    expect(rt.root.clearInterval        ).toCalledOnce();

                    //expect(results.messages).toStreamEqual(
                    //    next(230, 0), next(250, 0), next(310, 1), next(350,1), next(390, 2), next(450, 2), next(470, 3)
                    //);
                });
            });

            describe("mergeAll", function(){
                it("test merge interval streams", function () {
                    var sources = rt.fromArray([1, 2])
                        .map(function(value){
                            if(value === 2){
                                return rt.interval(100, scheduler);
                            }
                            else{
                                return rt.interval(60, scheduler);
                            }
                        });
                    var results = scheduler.startWithTime(function () {
                        return sources.mergeAll();
                    }, 150, 300);

                    expect(rt.root.clearInterval        ).toCalledTwice();
                    expect(results.messages).toStreamContain(
                        next(210, 0), next(250, 0), next(270, 1)
                    );
                });
                it("test merge timeout and interval stream", function () {
                    var sources = rt.fromArray([1, 2])
                        .map(function(value){
                            if(value === 2){
                                return rt.timeout(100, scheduler);
                            }
                            else{
                                return rt.interval(60, scheduler);
                            }
                        });
                    var results = scheduler.startWithTime(function () {
                        return sources.mergeAll();
                    }, 150, 300);

                    expect(rt.root.clearTimeout).toCalledOnce();
                    expect(rt.root.clearInterval).toCalledOnce();
                    expect(results.messages).toStreamContain(
                        next(210, 0), next(250, 100), next(270, 1)
                    );
                });
            });

            describe("takeUntil", function(){
                it("test1", function(){
                    var stream1 = scheduler.createStream(
                        next(200, 1),
                        next(300, 2),
                        next(400, 3),
                        completed(401)
                    );

                    var results = scheduler.startWithTime(function () {
                        return stream1.takeUntil(rt.interval(120, scheduler));
                    }, 150, 500);

                    expect(rt.root.clearInterval).toCalledOnce();
                    expect(results.messages).toStreamEqual(
                        next(200, 1), completed(270)
                    );
                })
            });

            describe("skipUntil", function(){
                it("test1", function(){
                    var stream1 = scheduler.createStream(
                        next(200, 1),
                        next(300, 2),
                        next(400, 3),
                        completed(401)
                    );

                    var results = scheduler.startWithTime(function () {
                        return stream1.skipUntil(rt.interval(120, scheduler));
                    }, 150, 500);

                    expect(rt.root.clearInterval).toCalledOnce();
                    expect(results.messages).toStreamEqual(
                        next(300, 2),
                        next(400, 3),
                        completed(401)
                    );
                })
            });

            it("repeat", function(){
                //todo finish
            });
        });
        
        describe("test multi stream", function(){
            beforeEach(function(){
                sandbox.stub(rt.root, "cancelNextRequestAnimationFrame");
                sandbox.stub(rt.root, "clearInterval");
            });

            it("test1", function(){
                var removeHandlerStub = sandbox.stub();
                var subscription1 = rt.interval(1000)
                    .merge(rt.intervalRequest())
                    .subscribe(function(){});
                var subscription2 = rt.interval(500)
                    .merge(rt.empty())
                    .subscribe(function(){});

                subscription1.dispose();

                var subscription3 = rt.fromArray([1])
                    .map(function(data){
                        return data * 2;
                    })
                    .merge(rt.fromEventPattern(function(){

                    }, removeHandlerStub))
                    .subscribe(function(){});

                subscription2.dispose();
                subscription3.dispose();

                expect(rt.root.cancelNextRequestAnimationFrame).toCalledOnce();
                expect(rt.root.clearInterval).toCalledTwice();
                expect(removeHandlerStub).toCalledOnce()
            });
            it("test2", function(){
                var stream1 = rt.interval(1000);
                var stream2 = rt.interval(500);

                var subscription1 = stream1.subscribe(function(){});

                var subscription2 = stream1.takeUntil(stream2)
                    .subscribe(function(){});

                subscription1.dispose();
                subscription2.dispose();

                expect(rt.root.clearInterval.withArgs(sinon.match.number)).toCalledThrice();
            });
        });
    });
});
