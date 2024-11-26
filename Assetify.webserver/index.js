(async () => {
    await require("@vstudio/assetify.webserver")({
        // Refer https://github.com/ov-studio/Vital.network/wiki/Module:-Server#-vnetworkcreate-shared
        bandwidth: 5
    })
})()
