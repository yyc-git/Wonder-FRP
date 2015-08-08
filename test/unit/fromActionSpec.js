describe("fromAction", function () {
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

    it("integrate test", function () {
        var result = [];
        var action = {
            isFinish: false,
            time: 0,

            update: function (time) {
                this.time += time;
                if (this.time > 100) {
                    this.isFinish = true;
                    return;
                }
            }
        };

        var subject = rt.fromAction(action);

        subject.subscribe(function (data) {
            result.push(data);
        }, function(err){
        }, function(){
            result.push(1);
        });

        subject.start();
        subject.next(10);
        subject.next(50);
        subject.next(50);
        subject.next(50);

        expect(result).toEqual([10, 50, 50, 1]);
    });
});

