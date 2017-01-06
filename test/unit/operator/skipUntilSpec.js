describe("skipUntil", function () {
    var rt = wdFrp,
        TestScheduler = rt.TestScheduler,
        next = TestScheduler.next,
        error = TestScheduler.error,
        completed = TestScheduler.completed;
    var scheduler = null;
    var sandbox = null;

    var stream1, stream2;
    var errorMsg;


    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        scheduler = TestScheduler.create();

        errorMsg = new Error("err");
    });
    afterEach(function () {
        sandbox.restore();
    });

    describe("source stream skip until other stream's data next", function () {
        beforeEach(function(){
            stream1 = scheduler.createStream(
                next(100, 1),
                next(200, 2),
                next(300, 3),
                completed(301)
            );

        });

        it("test1", function () {
            stream2 = scheduler.createStream(
                next(200, 1),
                completed(1000)
            );

            var results = scheduler.startWithSubscribe(function () {
                return stream1.skipUntil(stream2);
            }, 50);

            expect(results.messages).toStreamEqual(
                next(300, 3),
                completed(301)
            );
        });
        it("test2", function () {
            stream2 = scheduler.createStream(
                next(199, 1),
                completed(200)
            );

            var results = scheduler.startWithSubscribe(function () {
                return stream1.skipUntil(stream2);
            }, 50);

            expect(results.messages).toStreamEqual(
                next(300, 3),
                completed(301)
            );
        });
        it("test3", function () {
            stream2 = scheduler.createStream(
                next(199, 1),
                completed(201)
            );

            var results = scheduler.startWithSubscribe(function () {
                return stream1.skipUntil(stream2);
            }, 50);

            expect(results.messages).toStreamEqual(
                next(200, 2),
                next(300, 3),
                completed(301)
            );
        });
    });

    it("if the other stream error, the skip stream error", function () {
        stream1 = scheduler.createStream(
                next(100, 1),
                next(200, 2),
                next(300, 3),
                completed(301)
            );

            stream2 = scheduler.createStream(
                next(199, 1),
                error(210, errorMsg)
            );

            var results = scheduler.startWithSubscribe(function () {
                return stream1.skipUntil(stream2);
            }, 50);

            expect(results.messages).toStreamEqual(
                next(200, 2),
                error(210, errorMsg)
            );
    });

    it("if source stream is already completed when other stream' first next, the stream not next", function () {
        stream1 = scheduler.createStream(
                next(100, 1),
                next(200, 2),
                next(300, 3),
                completed(301)
            );

            stream2 = scheduler.createStream(
                next(301, 1),
                completed(510)
            );

            var results = scheduler.startWithSubscribe(function () {
                return stream1.skipUntil(stream2);
            }, 50);

            expect(results.messages).toStreamEqual(
            );
    });

    it("test trigger point tap event", function(){
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
        var mousedown = fromEvent(dom, 'mousedown');




        mouseup.subscribe(function(){
            sum2++;
        });

        var tap = mouseup.skipUntil(mousedown);

        var subscription = tap.subscribe(function(){
            sum1++;
        });



        expect(dom.on.withArgs("mouseup")).toCalledTwice();
        expect(dom.on.withArgs("mousedown")).toCalledOnce();




        dom.trigger("mouseup");

        expect(sum2).toEqual(1);
        expect(sum1).toEqual(0);


        dom.trigger("mousedown");

        expect(sum2).toEqual(1);
        expect(sum1).toEqual(0);
        expect(dom.off.withArgs("mousedown")).toCalledOnce();




        dom.trigger("mouseup");

        expect(sum2).toEqual(2);
        expect(sum1).toEqual(1);
        expect(dom.off.withArgs("mousedown")).toCalledOnce();

        dom.remove();
    });
    it("test trigger point tap event and trigger drag event", function(){
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
        var mousedown = fromEvent(dom, 'mousedown');
        var mousemove = fromEvent(dom, 'mousemove');



        //
        // mouseup.subscribe(function(){
        //     sum2++;
        // });

        var tap = mouseup.skipUntil(mousedown);

        var subscription = tap.subscribe(function(){
            sum1++;
        });



        var sum3 = 0;

        var mousedrag = mousedown.flatMap(function () {
            return mousemove.do(function(){
                sum3++;
                console.log("mousemove")
            }).takeUntil(mouseup);
        });


        var subscription2 = mousedrag.subscribe(function(){
            sum2++;
        });

        // expect(dom.on.withArgs("mouseup")).toCalledTwice();
        // expect(dom.on.withArgs("mousedown")).toCalledOnce();


        dom.trigger("mousedown");
        dom.trigger("mousemove");
        dom.trigger("mouseup");

        expect(sum2).toEqual(1);
        expect(sum3).toEqual(1);

        dom.trigger("mousemove");


        dom.trigger("mousedown");
        dom.trigger("mousemove");
        dom.trigger("mouseup");

        expect(sum2).toEqual(2);
        expect(sum3).toEqual(2);

        //
        // dom.trigger("mouseup");
        //
        // expect(sum2).toEqual(1);
        // expect(sum1).toEqual(0);
        //
        //
        // dom.trigger("mousedown");
        //
        // expect(sum2).toEqual(1);
        // expect(sum1).toEqual(0);
        // expect(dom.off.withArgs("mousedown")).toCalledOnce();
        //
        //
        //
        //
        // dom.trigger("mouseup");
        //
        // expect(sum2).toEqual(2);
        // expect(sum1).toEqual(1);
        // expect(dom.off.withArgs("mousedown")).toCalledOnce();

        dom.remove();
    });
});

