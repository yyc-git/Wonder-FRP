describe("filterWithState", function () {
    var rt = wdFrp;
    var State = rt.FilterState;
    var sandbox = null;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();

        testTool.openContractCheck(sandbox);
    });
    afterEach(function () {
        sandbox.restore();
    });

    describe("Filters the elements of an observable sequence based on a predicate." +
        "it will pass filter state to next() to mark whether it's enter or leave state, This will cause invoke next() one time more that it need to know whether it's leave state.", function () {
        it("invoke next() one time more", function () {
            var results = [];

            rt.fromArray([1, 2, 3])
                .filterWithState(function(value){
                    return value <= 2;
                })
                .subscribe(function(value, state){
                    results.push([value, state]);
                });

            expect(results[0]).toEqual([1, State.ENTER]);
            expect(results[1]).toEqual([2, State.TRIGGER]);
            expect(results[2]).toEqual([3, State.LEAVE]);
        });
        it("test multi filterWithState", function(){
            var results = [];

            rt.fromArray([1, 2, 3])
                .filterWithState(function(value){
                    return value <= 3;
                })
                .filterWithState(function(value){
                    return value <= 2;
                })
                .subscribe(function(value, state){
                    results.push([value, state]);
                });

            expect(results[0]).toEqual([1, State.ENTER]);
            expect(results[1]).toEqual([2, State.TRIGGER]);
            expect(results[2]).toEqual([3, State.LEAVE]);
        });
    });
});
