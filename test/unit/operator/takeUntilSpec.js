describe("takeUntil", function () {
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

    it("use drag example to test trigger mousedown again after trigger mouseup", function(){
        var sum1 = 0;
        var sum2 = 0;

        var dom = $("<div></div>");
        $("body").append(dom);


        sandbox.spy(dom, "on");
        sandbox.spy(dom, "off");

        function fromEvent(dom, eventName){
            return rt.fromEventPattern(function(h){
                dom.on(eventName, h);
            }, function(h){
                dom.off(eventName, h);
            });
        }

        var mouseup = fromEvent(dom, 'mouseup');
        var mousemove = fromEvent(dom, 'mousemove');
        var mousedown = fromEvent(dom, 'mousedown');




        mouseup.subscribe(function(){
            sum2++;
        });

        var mousedrag = mousedown.flatMap(function () {
            return mousemove.do(function(){
                console.log("mousemove")
            }).takeUntil(mouseup);
        });
        //var mousedrag = mousedown.flatMap(function () {
        //    return mousemove;
        //}).takeUntil(mouseup);
        //var mousedrag = mousemove.takeUntil(mouseup);

        var subscription = mousedrag.subscribe(function(){
            sum1++;
        });



        expect(dom.on.withArgs("mousemove")).not.toCalled();
        expect(dom.on.withArgs("mouseup")).toCalledOnce();


        dom.trigger("mousedown");

        expect(dom.on.withArgs("mousemove")).toCalledOnce();
        expect(dom.on.withArgs("mouseup")).toCalledTwice();


        dom.trigger("mousemove");
        expect(dom.on.withArgs("mousemove")).toCalledOnce();
        expect(dom.on.withArgs("mouseup")).toCalledTwice();
        expect(dom.off).not.toCalled();

        dom.trigger("mouseup");
        expect(dom.off).toCalledTwice();
        expect(dom.off).toCalledWith("mousemove");

        expect(sum1).toEqual(1);
        expect(sum2).toEqual(1);


        dom.trigger("mousemove");
        expect(sum1).toEqual(1);
        expect(sum2).toEqual(1);


        dom.trigger("mousedown");
        dom.trigger("mousemove");
        expect(sum1).toEqual(2);


        dom.trigger("mouseup");
        expect(sum1).toEqual(2);
        expect(sum2).toEqual(2);
        expect(dom.off.withArgs("mousemove")).toCalledTwice();



        dom.trigger("mousedown");
        dom.trigger("mousemove");
        dom.trigger("mouseup");
        expect(dom.off.withArgs("mousemove")).toCalledThrice();

        expect(sum1).toEqual(3);

        dom.remove();
    });
});

