describe("defer", function () {
    var rt = dyRt;
    var subject = null;
    var sandbox = null;
    var result = null;

    function subscribe(subject) {
        subscription = subject.subscribe(function (data) {
            result.push(data);
        }, function (err) {
            result.push(err);
        }, function () {
            result.push(-1);
        });
    }

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        subject = new rt.GeneratorSubject();
        result = [];
    });
    afterEach(function () {
        sandbox.restore();
    });

    describe("rewrite GeneratorSubject's hook method to insert user's logic into generatorSubject's next/error/completed method", function(){
        it("next", function(){
            var group = rt.defer(function(generatorSubject){
                generatorSubject.onBeforeNext = function(value){
                    result.push(value / 2);
                };
                generatorSubject.onAfterNext = function(){
                    result.push(-100);
                };
            })
                .map(function(value){
                    return value * 2;
                })
                .getSubjectGroup();

            subscribe(group);

            group.start();
            group.next(1);
            group.next(2);
            group.completed();

            expect(result).toEqual([0.5, 2, -100, 1, 4, -100, -1]);
        });
        it("error", function(){
            var err = new Error("err");
            var group = rt.defer(function(generatorSubject){
                generatorSubject.onBeforeError = function(err){
                    result.push(100);
                };
                generatorSubject.onAfterError = function(){
                    result.push(-100);
                };
            })
                .getSubjectGroup();

            subscribe(group);

            group.start();
            group.next(1);
            group.next(2);
            group.error(err);
            group.completed();

            expect(result).toEqual([1, 2, 100, err, -100]);
        });
        it("completed", function(){
            var group = rt.defer(function(generatorSubject){
                generatorSubject.onBeforeCompleted = function(){
                    result.push(100);
                };
                generatorSubject.onAfterCompleted = function(){
                    result.push(-100);
                };
            })
                .getSubjectGroup();

            subscribe(group);

            group.start();
            group.next(1);
            group.next(2);
            group.completed();

            expect(result).toEqual([1, 2, 100, -1, -100]);
        });
    });

    it("test multi observer and dispose", function(){
        var group = rt.defer(function(generatorSubject){
            generatorSubject.onBeforeCompleted = function(){
                result.push(100);
            };
            generatorSubject.onAfterCompleted = function(){
                result.push(-100);
            };
        })
            .getSubjectGroup();

        subscribe(group);
        subscribe(group);

        group.start();
        group.next(1);
        group.next(2);
        group.dispose();
        group.next(2);
        group.completed();

        expect(result).toEqual([1, 1, 2, 2]);
    });
});

