describe("fromArray", function(){
    var rt = dyRt;
    var sandbox = null;

    beforeEach(function(){
        sandbox = sinon.sandbox.create();
    });
    afterEach(function(){
        sandbox.restore();
    });

    describe("create stream from array", function(){
        it("test", function(){
            var sum = 0;
            var array = [1,2,3];
            rt.fromArray(array)
                .subscribe(function(x){
                    sum += x;
                }, function(e){
                }, function(){
                    expect(sum).toEqual(6);
                });
        });
    });
});
