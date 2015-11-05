describe("intervalRequest", function () {
    var rt = dyRt,
        TestScheduler = rt.TestScheduler,
        next = TestScheduler.next,
        completed = TestScheduler.completed;
    var scheduler = null;
    var sandbox = null;
    var time = null;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        scheduler = TestScheduler.create();
        time = 100;
    });
    afterEach(function () {
        sandbox.restore();
    });

    describe("invoke requestNextAnimationFrame to loop", function(){
        var count = null;

        beforeEach(function(){
            count = 2;

            fakeRequestNextAnimationFrame();
        });

        function fakeRequestNextAnimationFrame(){
            sandbox.stub(rt.root, "requestNextAnimationFrame", function(action){
                if(count <= 0){
                    return count;
                }

                count--;

                action(time);

                return count;
            });
        }

        it("invoke requestNextAnimationFrame to loop", function () {
            var next = sandbox.stub();

            rt.intervalRequest().subscribe(next);

            expect(next).toCalledTwice();
            expect(next.firstCall).toCalledWith(time);
            expect(next.secondCall).toCalledWith(time);
        });

        describe("dispose", function(){
            it("use cancelNextRequestAnimationFrame to dispose", function(){
                sandbox.stub(rt.root, "cancelNextRequestAnimationFrame");
                var suscription = rt.intervalRequest().subscribe(function(){});

                suscription.dispose();

                expect(rt.root.cancelNextRequestAnimationFrame).toCalledWith(0);
            });
            it("set the flag 'isEnd' to true", function(){
                var stream = rt.intervalRequest();
                var suscription = stream.subscribe(function(){});

                suscription.dispose();

                expect(stream._isEnd).toBeTruthy();
            });
        });
    });

    describe("use TestScheduler to mock", function(){
        it("mock test", function(){
            var results;

            results = scheduler.startWithSubscribe(function () {
                return rt.intervalRequest(scheduler);
            });

            expect(results.messages).toStreamContain(
                next(300, 0), next(400, 1), next(500, 2)
            );
        });
        it("set dispose time", function () {
            var results;

            results = scheduler.startWithDispose(function () {
                return rt.intervalRequest(scheduler);
            }, 400);

            expect(results.messages).toStreamEqual(
                next(300, 0)
            );
        });
    });
});
