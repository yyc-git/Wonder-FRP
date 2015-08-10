describe("takeUntil", function () {
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

    describe("Returns the values from the source stream until the other stream or Promise produces a value", function () {
        it("other stream", function () {
            var stream1 = scheduler.createStream(
                next(100, 1),
                next(200, 2),
                next(300, 3),
                completed(301)
            );

            var stream2 = scheduler.createStream(
                next(300, 1),
                next(400, 2),
                completed(500)
            );

            var results = scheduler.startWithSubscribe(function () {
                return stream1.takeUntil(stream2);
            }, 50);

            expect(results.messages).toStreamEqual(
                next(100, 1),
                next(200, 2),
                completed(300)
            );
        });
        it("other promise", function () {
            var stream1 = scheduler.createStream(
                next(100, 1),
                next(200, 2),
                next(300, 3),
                completed(301)
            );
            var promise = scheduler.createResolvedPromise(200, 1);

            var results = scheduler.startWithSubscribe(function () {
                return stream1.takeUntil(promise);
            }, 50);

            expect(results.messages).toStreamEqual(
                next(100, 1),
                completed(200)
            );
        });
        it("when other stream error", function () {
            var errorMsg = new Error("err");
            var stream1 = scheduler.createStream(
                next(100, 1),
                next(200, 2),
                next(300, 3),
                completed(301)
            );

            var stream2 = scheduler.createStream(
                error(200, errorMsg)
            );

            var results = scheduler.startWithSubscribe(function () {
                return stream1.takeUntil(stream2);
            }, 50);

            expect(results.messages).toStreamEqual(
                next(100, 1),
                error(200, errorMsg)
            );
        });
    });

    describe("generator subject", function(){
        var result;

        function subscribe(subject){
            subscription = subject.subscribe(function (data) {
                result.push(data);
            }, function(err){
                result.push(err);
            }, function(){
                result.push(-1);
            });
        }

        beforeEach(function(){
            result = [];
        });

        describe("if subject not start, subject.next/error/completed will not work", function(){
            var subject2;

            beforeEach(function(){
                subject2 = rt.AsyncSubject.create();
                subject = rt.AsyncSubject.create().takeUntil(subject2);

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

        it("generator subject can only takeUntil generator subject", function(){
            expect(function(){
                rt.AsyncSubject.create().takeUntil(rt.fromArray([1]))
            }).toThrow();
        });
        it("normal test", function(){
            var subject2 = rt.AsyncSubject.create();

            subject = rt.AsyncSubject.create().takeUntil(subject2);

            subscribe(subject);

            subject.start();
            subject.next(1);
            subject.next(2);
            subject2.start();
            subject2.next(3);
            subject.next(4);

            expect(result).toEqual([1, 2, -1]);
        });

        describe("error", function(){
            it("if the takeUntiled subject->next throw error, it will not trigger the main subject->completed", function(){
                var subject2 = rt.AsyncSubject.create();
                var err = new Error("err");
                subject2.onBeforeNext = function(data){
                    throw err;
                };

                subject = rt.AsyncSubject.create().takeUntil(subject2);

                subscribe(subject);

                subject.start();
                subject.next(1);
                subject.next(2);
                subject2.start();
                subject2.next(3);
                subject.next(4);

                expect(result).toEqual([1, 2, err]);
            });
            it("test the main subject error", function(){
                var subject2 = rt.AsyncSubject.create();
                var err = new Error("err");

                subject = rt.AsyncSubject.create().takeUntil(subject2);

                subscribe(subject);

                subject.start();
                subject.next(1);
                subject.error(err);

                expect(result).toEqual([1, err]);
            });
        });
    });
});

