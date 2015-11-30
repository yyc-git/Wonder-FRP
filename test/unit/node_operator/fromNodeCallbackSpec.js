describe("fromNodeCallback", function () {
    var rt = wdFrp;
    var sandbox = null;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });
    afterEach(function () {
        sandbox.restore();
    });

    it("simple test", function(){
        var res = rt.fromNodeCallback(function (cb) {
            cb(null);
        })();

        res.subscribe(function(data){
            expect().toPass();
        });
    });
    it("test single param", function () {
        var result = [];
        var res = rt.fromNodeCallback(function (str, cb) {
            cb(null, str);
        })("foo");

        res.subscribe(
            function (r) {
                expect(r).toEqual("foo");
            },
            function (err) {
                expect().toFail();
            },
            function () {
                result.push(1);
            });

        expect(result).toEqual([1]);
    });
    it("test multi params", function () {
        var res = rt.fromNodeCallback(function (str1, str2, cb) {
            cb(null, str1, str2);
        })("foo", "aaa");

        res.subscribe(
            function (r) {
                expect(r).toEqual(["foo", "aaa"]);
            },
            function (err) {
                expect().toFail();
            },
            function () {
                expect().toPass();
            });
    });
    it("test context", function () {
        var context = {a:100};
        var res = rt.fromNodeCallback(
            function (cb) {
                expect(this.a).toEqual(100);
                cb(null);
            }, context)();

        res.subscribe(
            function () {
                expect().toPass();
            },
            function (err) {
                expect().toFail();
            },
            function () {
                expect().toPass();
            });
    });
    it("test error", function () {
        var error = new Error();

        var res = rt.fromNodeCallback(function (cb) {
            cb(error);
        })();

        res.subscribe(
            function () {
                expect().toFail();
            },
            function (err) {
                expect(err).toEqual(error);
            },
            function () {
                expect().toFail();
            });
    });
});

