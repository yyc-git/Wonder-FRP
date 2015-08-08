describe("AsyncSubject", function () {
    var rt = dyRt;
    var subject = null;
    var sandbox = null;
    var result = null;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        subject = new rt.AsyncSubject();
        result = [];

        subject.subscribe(function (data) {
            result.push(data);
        }, function(err){
            result.push(err);
        }, function(){
            result.push(1);
        });
    });
    afterEach(function () {
        sandbox.restore();
    });

    it("generate stream by using subject.next", function(){
        subject.start();
        subject.next(10);
        subject.next(50);
        subject.completed();

        expect(result).toEqual([10, 50, 1]);
    });
    it("error", function(){
        var error = new Error("err");

        subject.start();
        subject.next(10);
        subject.next(50);
        subject.error(error);
        subject.completed();

        expect(result).toEqual([10, 50, error]);
    });
});

