var testTool = (function(){
    return {
        /*!
         can only affect In,Out check
         Invariant check will be invoked when load the file
         */
        openContractCheck: function (sandbox) {
            sandbox.stub(wdFrp.Main, "isTest", true);
        }
    }
})();
