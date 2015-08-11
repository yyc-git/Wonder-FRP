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

    describe("concat generator subject", function () {
        var error = null;
        var subscription = null;

        function subscribe(subject){
            subscription = subject.subscribe(function (data) {
                result.push(data);
            }, function(err){
                result.push(err);
            }, function(){
                result.push(1);
            });
        }

        describe("if subject not start, subject.next/error/completed will not work", function(){
            var subject, subject2;

            beforeEach(function(){
                subject2 = rt.AsyncSubject.create();
                subject = rt.AsyncSubject.create().concat(subject2);

                subscribe(subject);
            });
            it("test subject.next/completed", function(){
                subject.next(10);
                subject.next(50);
                subject.completed();

                expect(result).toEqual([]);
            });
            it("test subject.error", function(){
                var error = new Error("err");

                subject.error(error);

                expect(result).toEqual([]);
            });
        });

        describe("concat all generator subject", function(){
            var subject = null,
                subject1 = null,
                subject2 = null,
                subject3 = null,
                next1,next2,next3;

            beforeEach(function(){
                error = new Error("err");
                subject1 = rt.AsyncSubject.create();
                subject2 = rt.AsyncSubject.create();
                subject3 = rt.AsyncSubject.create();
                next1 = subject1.next;
                next2 = subject2.next;
                next3 = subject3.next;

                subject1.onIsCompleted = function(data){
                    return data >= 10;
                };
                subject2.onIsCompleted = function(data){
                    return data >= 50;
                };
                subject3.onIsCompleted = function(data){
                    return data >= 20;
                };
            });

            it("test dispose", function(){
                subject = subject1.concat(subject2, subject3);

                subscribe(subject);

                subject.start();
                subject.next(1);
                subscription.dispose();
                subject.next(50);
                subject.next(50);
                subject.next(22);
                subject.next(50);

                expect(result).toEqual([1]);
            });

            describe("test concat", function(){
                beforeEach(function(){
                    subject = subject1.concat(subject2, subject3);
                    subscribe(subject);
                });

                it("can concat multi generator subject", function(){
                    subject.start();
                    subject.next(9);
                    subject.next(20);
                    subject.next(50);
                    subject.next(22);
                    subject.next(50);

                    expect(result).toEqual([9, 20, 50, 22, 1]);
                });

                describe("error", function(){
                    it("subject error, first handle by the occured subject, then handle by the subscribed error handler", function(){
                        var error = subject2.error;
                        var err = new Error("err");
                        subject2.onBeforeError = function(data){
                            result.push(data);
                            result.push(0);
                        };

                        subject.start();
                        subject.next(10);
                        subject.error(err);
                        subject.completed();

                        expect(result).toEqual([10, err, 0, err]);
                    });
                    it("concated subject error, first handle by the occured subject, then handle by the subscribed error handler", function(){
                        var error = subject2.error;
                        var err1 = new Error("err1"),
                            err2 = new Error("err2");
                        subject2.onBeforeError = function(data){
                            result.push(data);
                            result.push(0);
                        };
                        subject2.onBeforeNext = function(data){
                            if(data >= 10){
                                throw err1;
                            }
                        };

                        subject.start();
                        subject.next(10);
                        subject.next(5);
                        subject.next(10);
                        subject.completed();

                        expect(result).toEqual([10, 5, err1, 0, err1]);
                    });
                });

                describe("completed", function(){
                    it("if concated subject aren't all completed, invoke the occured subject->completed", function(){
                        var completed = subject2.completed;
                        subject2.onBeforeCompleted = function(){
                            result.push(0);
                        };

                        subject.start();
                        subject.next(10);
                        subject.completed();

                        expect(result).toEqual([10, 0]);
                    });
                    it("else, invoke subscribed completed handler", function(){
                        subject2.onBeforeCompleted = function(){
                            result.push(0);
                        };

                        subject.start();
                        subject.next(10);
                        subject.next(50);
                        subject.next(20);
                        subject.completed();

                        expect(result).toEqual([10, 50, 0, 20, 1]);
                    });
                });
            });

            describe("multi opeator", function(){
                beforeEach(function(){

                });

                it("map", function(){
                    subject = subject1.concat(subject2, subject3)
                        .map(function(x) {
                            return x * 2;
                        });

                    subscribe(subject);

                    subject.start();
                    subject.next(9);
                    subject.next(20);
                    subject.next(50);
                    subject.next(22);
                    subject.next(50);

                    expect(result).toEqual([18, 40, 100, 44, 1]);
                });
            });

            describe("multi concat", function(){
                it("test1", function(){
                    subject = subject1.concat(subject2.concat(subject3));

                    subscribe(subject);

                    subject.start();
                    subject.next(10);
                    subject.next(50);
                    subject.next(20);
                    subject.next(100);

                    expect(result).toEqual([10, 50, 20, 1]);
                });
                it("test2", function(){
                    var subject4 = rt.AsyncSubject.create();
                    subject4.onIsCompleted = function(data){
                        return data >= 10;
                    };
                    var subject5 = rt.AsyncSubject.create();
                    subject5.onIsCompleted = function(data){
                        return data >= 10;
                    };

                    subject = subject1.concat(subject2)
                        .concat(subject3.concat(subject4))
                        .concat(subject5);

                    subscribe(subject);

                    subject.start();
                    subject.next(10);
                    subject.next(50);
                    subject.next(20);
                    subject.next(10);
                    subject.next(10);
                    subject.next(70);

                    expect(result).toEqual([10, 50, 20, 10, 10, 1]);
                });
            });
        });

        it("if concat generator subject and stream, it will throw error", function(){
            expect(function(){
                subject = rt.AsyncSubject.create()
                    .concat(rt.AsyncSubject.create(), rt.fromArray([1, 2]));
            }).toThrow();
        });
    });


    it("if concat generator subject and stream, it will throw error", function(){
        expect(function(){
            rt.fromArray([1, 2])
                .concat(rt.fromArray([1, 2]), rt.AsyncSubject.create());
        }).toThrow();
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
            });

            expect(result).toEqual([2, 4, 6, 8, 10]);
        });
    });
});

