describe("fromEventPattern", function () {
    var rt = wdFrp,
        TestScheduler = rt.TestScheduler,
        next = TestScheduler.next,
        completed = TestScheduler.completed;
    var scheduler = null;
    var sandbox = null;
    var canvasId = null;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        scheduler = TestScheduler.create();

        canvasId = "test_engine";
        $("body").append($("<canvas id=" + canvasId + "></canvas>"));
    });
    afterEach(function () {
        sandbox.restore();
        $("#" + canvasId).remove();
    });

    it("single handler", function(){
        var eventTriggered = null,
            isOff = false,
            sum = 0;

        var subscription = rt.fromEventPattern(
            function(handler){
                $("canvas").on("mousedown", handler);
            },
            function(handler){
                $("canvas").off("mousedown", handler);
                isOff = true;
            })
            .subscribe(function(e){
                eventTriggered = e;
                sum ++;
            });

        $("canvas").trigger("mousedown");

        expect(eventTriggered.type).toEqual("mousedown");
        expect(sum).toEqual(1);

        subscription.dispose();
        $("canvas").trigger("mousedown");

        expect(isOff).toBeTruthy();
        expect(sum).toEqual(1);
    });

    describe("multi handler for one eventType", function(){
        describe("subject", function(){
            var eventTriggered = null,
                eventTriggered2 = null,
                isOff = false,
                sum = 0,
                sum2 = 0;
            var fakeEvent = null;
            var subject = null;
            var subscription1 = null,
                subscription2 = null;

            beforeEach(function(){
                eventTriggered = null;
                eventTriggered2 = null;
                isOff = false;
                sum = 0;
                sum2 = 0;

                subject = rt.Subject.create();

                rt.fromEventPattern(
                    function(handler){
                        $("canvas").on("mousedown", handler);
                    },
                    function(handler){
                        $("canvas").off("mousedown", handler);
                        isOff = true;
                    })
                    .subscribe(subject);

                subscription1 = subject.subscribe(function(e){
                    eventTriggered = e;
                    sum ++;
                });
                subscription2 = subject.subscribe(function(e){
                    eventTriggered2 = e;
                    sum2 ++;
                });
                subject.start();
            });

            it("trigger", function(){
                $("canvas").trigger("mousedown");

                expect(eventTriggered.type).toEqual("mousedown");
                expect(eventTriggered2.type).toEqual("mousedown");
                expect(sum).toEqual(1);
                expect(sum2).toEqual(1);
            });
            it("it will invoke removeHandler when disposing arbitrary one", function(){
                subscription2.dispose();
                $("canvas").trigger("mousedown");

                expect(isOff).toBeTruthy();
                expect(sum).toEqual(0);
                expect(sum2).toEqual(0);
            });
        });

        describe("multi invoke fromEventPattern", function(){
            var eventTriggered = null,
                eventTriggered2 = null,
                isOff = false,
                sum = 0,
                sum2 = 0;
            var fakeEvent = null;
            var subscription1 = null,
                subscription2 = null;
            var fakeObj = null;

            beforeEach(function(){
                eventTriggered = null;
                eventTriggered2 = null;
                isOff = false;
                sum = 0;
                sum2 = 0;

                fakeObj = {
                    a:sandbox.stub(),
                    b:sandbox.stub()
                };


                subscription1 = rt.fromEventPattern(
                    function(handler){
                        $("canvas").on("mousedown", handler);
                    },
                    function(handler){
                        $("canvas").off("mousedown", handler);
                        isOff = true;
                    })
                    .subscribe(function(e){
                        eventTriggered = e;
                        sum ++;
                        fakeObj.a();
                    });

                subscription2 = rt.fromEventPattern(
                    function(handler){
                        $("canvas").on("mousedown", handler);
                    },
                    function(handler){
                        $("canvas").off("mousedown", handler);
                        isOff = true;
                    })
                    .subscribe(function(e){
                        eventTriggered2 = e;
                        sum2 ++;
                        fakeObj.b();
                    });
            });

            it("trigger", function(){
                $("canvas").trigger("mousedown");

                expect(eventTriggered.type).toEqual("mousedown");
                expect(eventTriggered2.type).toEqual("mousedown");
                expect(sum).toEqual(1);
                expect(sum2).toEqual(1);
            });
            it("it will invoke the specify removeHandler when disposing", function(){
                subscription2.dispose();
                $("canvas").trigger("mousedown");

                expect(isOff).toBeTruthy();
                expect(sum).toEqual(1);
                expect(sum2).toEqual(0);
            });
        });
    });
});
