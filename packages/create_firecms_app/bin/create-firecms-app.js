#!/usr/bin/env node
(async () => {
    const fireCMS = await import("@edumetz16/firecms_cli");
    fireCMS.createFireCMSApp(process.argv);
})();
