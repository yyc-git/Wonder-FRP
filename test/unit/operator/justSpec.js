describe("just", function () {
    var rt = wdFrp;
    var sandbox = null;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });
    afterEach(function () {
        sandbox.restore();
    });

    it("return value", function(){
        var result = [];

        rt.just(20)
            .subscribe(function(data){
                result.push(data);
            }, null, function(){
                result.push(-1);
            });

        expect(result).toEqual(
            [20, -1]
        );
    });
});

