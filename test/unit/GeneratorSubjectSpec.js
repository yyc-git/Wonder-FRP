describe("GeneratorSubject", function () {
    var rt = dyRt;
    var subject = null;
    var sandbox = null;
    var result = null;
    var subscription = null;

    function subscribe(subject){
        subscription = subject.subscribe(function (data) {
            result.push(data);
        }, function(err){
            result.push(err);
        }, function(){
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

    describe("generate stream", function(){
        beforeEach(function () {
            subscribe(subject);
        });

        it("using subject.next", function(){
            subject.start();
            subject.next(10);
            subject.next(50);
            subject.completed();

            expect(result).toEqual([10, 50, -1]);
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

    it("if no observer, subject.next/error/completed will not work", function(){
        subject.onBeforeNext = function(value){
            result.push(value / 2);
        };
        subject.onAfterNext = function(){
            result.push(-100);
        };

        subject.start();
        subject.next(10);
        subject.next(50);
        subject.completed();

        expect(result).toEqual([]);
    });

    describe("if subject not start, subject.next/error/completed will not work", function(){
        it("test subject.next/completed", function(){
            subject.next(10);
            subject.next(50);
            subject.completed();

            expect(result).toEqual([]);
        });
        it("test subject.error", function(){
            var error = new Error("err");

            subject.error(error);

            expect(result).toEqual([]);
        });
    });

    it("toStream", function(){
        var stream = subject
            .toStream()
            .map(function (x) {
                return x * 2;
            });

        subscribe(stream);

        subject.start();
        subject.next(1);
        subject.next(10);
        subject.next(50);
        subject.completed();

        expect(result).toEqual([2, 20, 100, -1]);
    });

    //describe("getSubjectGroup", function(){
    //    it("if sources mix GeneratorSubject and Stream, the returned group will only effect the GeneratorSubjects", function(){
    //        var group = subject.toStream()
    //            .merge(rt.fromArray([1, 2]))
    //            .getSubjectGroup();
    //
    //        subscribe(group);
    //
    //        group.start();
    //        group.next(1);
    //        group.next(10);
    //        group.next(50);
    //        subject.completed();
    //
    //        expect(result).toEqual([1, 2, 1, 10, 50, -1]);
    //    });
    //    it("error", function(){
    //        var err = new Error("err");
    //        var group = subject
    //            .toStream()
    //            .getSubjectGroup();
    //
    //        subscribe(group);
    //
    //        group.start();
    //        group.next(1);
    //        group.error(err);
    //        group.next(2);
    //
    //        expect(result).toEqual([1, err]);
    //    });
    //    it("completed", function(){
    //        var group = subject
    //            .toStream()
    //            .getSubjectGroup();
    //
    //        subscribe(group);
    //
    //        group.start();
    //        group.next(1);
    //        group.next(2);
    //        group.completed();
    //        group.next(3);
    //
    //        expect(result).toEqual([1, 2, -1]);
    //    });
    //    it("dispose", function(){
    //        var group = subject
    //            .toStream()
    //            .getSubjectGroup();
    //
    //        subscribe(group);
    //
    //        group.start();
    //        group.next(1);
    //        group.next(2);
    //        group.dispose();
    //        group.next(3);
    //        group.completed();
    //
    //        expect(result).toEqual([1, 2]);
    //    });
    //    it("multi observer", function(){
    //        var group = subject
    //            .toStream()
    //            .getSubjectGroup();
    //
    //        subscribe(group);
    //        subscribe(group);
    //
    //        group.start();
    //        group.next(1);
    //        group.next(2);
    //        group.dispose();
    //        group.next(3);
    //        group.completed();
    //
    //        expect(result).toEqual([1, 1, 2, 2]);
    //    });
    //
    //    describe("now support merge,concat,map,do,repeat operator", function(){
    //        it("merge and concat", function(){
    //            var subject = new rt.GeneratorSubject();
    //            var subject2 = rt.GeneratorSubject.create();
    //            var subject3 = rt.GeneratorSubject.create();
    //            var group = subject
    //                .toStream()
    //                .concat(subject2.toStream())
    //                .merge(subject3.toStream())
    //                .map(function (x) {
    //                    return x * 2;
    //                })
    //                .getSubjectGroup();
    //
    //            subscribe(group);
    //
    //            group.start();
    //            group.next(1);
    //            group.next(10);
    //            group.next(50);
    //            subject.completed();
    //            group.next(100);
    //            subject3.completed();
    //            group.next(500);
    //            subject2.completed();
    //
    //            expect(result).toEqual([2, 2, 20, 20, 100, 100, 200, 200, 1000, -1]);
    //        });
    //        it("multi merge and concat", function(){
    //            var subject2 = rt.GeneratorSubject.create();
    //            var subject3 = rt.GeneratorSubject.create();
    //            var subject4 = rt.GeneratorSubject.create();
    //            var subject5 = rt.GeneratorSubject.create();
    //            var subject6 = rt.GeneratorSubject.create();
    //            var subject7 = rt.GeneratorSubject.create();
    //
    //            var group = subject.toStream()
    //                .concat(subject2.toStream().concat(subject3.toStream()))
    //                .merge(subject4.toStream().merge(subject5.toStream()))
    //                .concat(subject6.toStream())
    //                .merge(subject7.toStream())
    //                .map(function (x) {
    //                    return x * 2;
    //                })
    //                .getSubjectGroup();
    //
    //
    //            subscribe(group);
    //
    //            group.start();
    //            group.next(1);
    //            subject.completed();
    //            group.next(2);
    //            subject4.completed();
    //            group.next(3);
    //            subject2.completed();
    //            group.next(4);
    //            subject3.completed();
    //            group.next(5);
    //            subject5.completed();
    //            group.next(6);
    //            subject6.completed();
    //            group.next(7);
    //            subject7.completed();
    //            group.next(8);
    //
    //            expect(result).toEqual([
    //                2, 2, 2, 2, 4, 4, 4, 4, 6, 6, 6, 8, 8, 8, 10, 10, 12, 12, 14, -1
    //            ]);
    //        });
    //        it("multi operator", function(){
    //            var group = subject.toStream()
    //                .map(function (value) {
    //                    return value * 2;
    //                })
    //                .do(function (value) {
    //                    result.push(value * 2);
    //                }, function (err) {
    //                })
    //                .getSubjectGroup();
    //
    //            subscribe(group);
    //
    //            group.start();
    //            group.next(1);
    //            group.next(2);
    //
    //
    //            expect(result).toEqual([
    //                4, 2, 8, 4
    //            ]);
    //        });
    //        it("repeat", function(){
    //            var group = subject.toStream()
    //                .repeat(2)
    //                .getSubjectGroup();
    //
    //            subject.onIsCompleted = function(value){
    //                if(value >= 10){
    //                    return true;
    //                }
    //
    //                return false;
    //            };
    //
    //            subscribe(group);
    //
    //            group.start();
    //            group.next(1);
    //            group.next(20);
    //            group.next(30);
    //            group.next(2);
    //            group.next(20);
    //
    //
    //            expect(result).toEqual([
    //                1, 20, 30, -1
    //            ]);
    //        });
    //    });
    //});
});

