

{
    const DOMContentLoaded_event = document.createEvent("Event");
    DOMContentLoaded_event.initEvent("DOMContentLoaded", true, true);
    window.document.dispatchEvent(DOMContentLoaded_event);
}

const waitTime = 200;
let waitedFor = 0;

const waitForDepts = () => {

    const hasJQuery = typeof (window.$) !== "undefined";
    const hasSoundManager = typeof (window.soundManager) !== "undefined";
    const hasD20 = typeof (window.d20) !== "undefined";

    if (!hasJQuery || !hasSoundManager || !hasD20) {
        waitedFor += waitTime;
        setTimeout(waitForDepts, waitTime);

        console.log("WAITING FOR DEPTS.");
        console.log(hasJQuery);
        console.log(hasSoundManager);
        console.log(hasD20);

        return;
    }

    console.log(`All dependencies fulfilled after ${waitedFor}ms`);

    for (let i = 0; i < window.r20esChrome.readyCallbacks.length; i++) {
        window.r20esChrome.readyCallbacks[i]();
    }

   
}
waitForDepts();

