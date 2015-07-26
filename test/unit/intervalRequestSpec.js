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
        it("use cancelNextRequestAnimationFrame to dispose", function(){
            sandbox.stub(rt.root, "cancelNextRequestAnimationFrame");
            var next = sandbox.stub();

            var suscription = rt.intervalRequest().subscribe(next);
            suscription.dispose();

            expect(rt.root.cancelNextRequestAnimationFrame).toCalledWith(0);
        });
    });

    describe("use TestScheduler to mock", function(){
        it("mock test", function(){
            var results;

            results = scheduler.startWithSubscribe(function () {
                return rt.intervalRequest(scheduler);
            });

            expect(results.messages).toStreamContain(
                next(300, time), next(400, time), next(500, time)
            );
        });
        it("set dispose time", function () {
            var results;

            results = scheduler.startWithDispose(function () {
                return rt.intervalRequest(scheduler);
            }, 400);

            expect(results.messages).toStreamEqual(
                next(300, time)
            );
        });
    });
});
