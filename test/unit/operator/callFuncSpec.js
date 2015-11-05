describe("callFunc", function(){
    var rt = dyRt,
        TestScheduler = rt.TestScheduler,
        next = TestScheduler.next,
        completed = TestScheduler.completed;
    var scheduler = null;
    var sandbox = null;

    beforeEach(function(){
        sandbox = sinon.sandbox.create();
        scheduler = TestScheduler.create();
    });
    afterEach(function(){
        sandbox.restore();
    });

    it("invoke function in the specific context", function(){
        var context = {
            a: 1
        };
        var result = [];

        rt.callFunc(function(){
            this.a++;

            return this.a;
        }, context)
            .subscribe(function(a){
                result.push(a);
            });

        expect(result).toEqual([2]);
        expect(context.a).toEqual(2);
    });
    it("default context is window", function() {
        rt.callFunc(function () {
            this.a = 1;

            return this.a;
        })
            .subscribe(function (a) {
            });

        expect(window.a).toEqual(1);

        delete window.a;
    });
    it("if error, pass to errorHandler", function(){
        var err = new Error("err");
        var result = null;

        rt.callFunc(function () {
            throw err;
        })
            .subscribe(function () {
            }, function(e){
                result = e;
            });

        expect(result).toEqual(err);
    });
    it("multi operator", function(){
        var result = [];

        rt.fromArray([1, 2])
            .concat(rt.callFunc(function(){
                return 10;
            }))
            .subscribe(function(data){
                result.push(data);
            });

        expect(result).toEqual([1, 2, 10]);
    });
});
