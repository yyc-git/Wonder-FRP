describe("flatMap", function () {
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

    describe("map and merge all promise", function () {
        it("all success", function(done){
            var res = [];
            var sources = rt.fromArray([1, 2])
                .flatMap(function (value) {
                    return new RSVP.Promise(function (res, rej) {
                        res(value);
                    });
                });

            sources.subscribe(
                function (x) {
                    res.push(x);
                },
                function (err) {
                },
                function () {
                    expect(res).toEqual([1, 2]);
                    done();
                });
        });
        it("error", function(done){
            var res = [];
            var sources = rt.fromArray([1, 2])
                .flatMap(function (value) {
                    return new RSVP.Promise(function (res, rej) {
                        if(value === 2){
                            rej(value);
                        }
                        else{
                            res(value);
                        }
                    });
                });

            sources.subscribe(
                function (x) {
                    res.push(x);
                },
                function (err) {
                    expect(res).toEqual([1]);
                    expect(err).toEqual(2);
                    done();
                },
                function () {
                });
        });
    });

    describe("map and merge stream", function(){
        it("map fromPromise and do stream", function(done){
            var res = [];
            var result = 0;
            var sources = rt.fromArray([1, 2])
                .flatMap(function (value) {
                    return rt.fromPromise(new RSVP.Promise(function (res, rej) {
                        res(value);
                    })).do(function(x){
                        result += x;
                    }, function(err){

                    }, function(){

                    });
                });

            sources.subscribe(
                function (x) {
                    res.push(x);
                },
                function (err) {
                },
                function () {
                    expect(res).toEqual([1, 2]);
                    expect(result).toEqual(1 + 2);
                    done();
                });
        });
        it("map array stream", function(){
            var res = [];
            var result = null;
            var sources = rt.fromArray([1, 2, 3])
                .flatMap(function(value){
                    return rt.fromArray([value, value + 1]);
                });

            sources.subscribe(
                function (x) {
                    res.push(x);
                },
                function (err) {
                },
                function () {
                    result = res;
                });

            expect(result).toEqual([1, 2, 2, 3, 3, 4]);
        });
        it("map interval stream", function(){
            var scheduler = TestScheduler.create(true);
            var sources = rt.fromArray([1, 2])
                .flatMap(function(value){
                    if(value === 2){
                        return rt.interval(100, scheduler);
                    }
                    else{
                        return rt.interval(60, scheduler);
                    }
                });
            results = scheduler.startWithSubscribe(function () {
                return sources;
            });

            expect(results.messages).toStreamContain(
                next(260, 0), next(300, 0), next(320, 1), next(380, 2), next(400, 1)
            );
        });
    });

    it("do after flatMap", function(){
        var res = [];
        var result = null;
        var sum = 0;
        var sources = rt.fromArray([1, 2, 3])
            .flatMap(function(value){
                return rt.fromArray([value, value + 1]);
            });

        sources.do(function(x){
                sum += x;
            })
            .subscribe(
            function (x) {
                res.push(x);
            },
            function (err) {
            },
            function () {
                result = res;
            });

        expect(sum).toEqual(1 + 2 + 2 + 3 + 3 + 4);
        expect(result).toEqual([1, 2, 2, 3, 3, 4]);
    });

    describe("fix bug", function(){
        it("when MergeAllObserver->InnerObserver complete, should dispose inner stream", function () {
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




            var mousedrag = mousedown.flatMap(function () {
                return mousemove.takeUntil(mouseup.do(function(){
                    sum2++;
                }));
            });

            var subscription = mousedrag.subscribe(function(){
            });


            dom.trigger("mousedown");
            dom.trigger("mousemove");
            dom.trigger("mouseup");

            expect(sum2).toEqual(1);


            dom.trigger("mousedown");
            dom.trigger("mousemove");
            dom.trigger("mouseup");

            expect(sum2).toEqual(2);



            dom.remove();
        });
    });
});
