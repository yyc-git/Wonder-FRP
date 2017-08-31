describe("fromEvent", function () {
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

    it("single handler", function () {
        var eventTriggered = null,
            sum = 0;

        var subscription = rt.fromEvent($("canvas").get(0),
            "click")
            .subscribe(function (e) {
                eventTriggered = e;
                sum++;
            });

        $("canvas").trigger("click");

        expect(eventTriggered.type).toEqual("click");
        expect(sum).toEqual(1);

        subscription.dispose();
        $("canvas").trigger("click");

        expect(sum).toEqual(1);
    });
});
