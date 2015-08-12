/// <reference path="../definitions.d.ts"/>
module dyRt{
    export class SubjectGroup{
        public static create() {
        	var obj = new this();

        	return obj;
        }

        public subjectList:dyCb.Collection<GeneratorSubject> = dyCb.Collection.create<GeneratorSubject>();
        public stream:Stream = null;

        public subscribe(onNext:Function, onError:Function, onCompleted:Function):IDisposable {
            return this.stream.subscribe(onNext, onError, onCompleted);
        }

        public start(){
            this.subjectList.forEach(function(subject){
                subject.start();
            });
        }

        public next(value:any){
            this.subjectList.forEach(function(subject){
                subject.next(value);
            });
        }

        public error(err:any){
            this.subjectList.forEach(function(subject){
                subject.error(err);
            });
        }

        public completed(){
            this.subjectList.forEach(function(subject){
                subject.completed();
            });
        }

        public dispose(){
            this.subjectList.forEach(function(subject){
                subject.dispose();
            });
        }

        public addChild(subject:GeneratorSubject){
            this.subjectList.addChild(subject);
        }

        public addChildren(group:SubjectGroup){
            this.subjectList.addChildren(group.subjectList);
        }
    }
}

