// ==UserScript==
// @name         Better Resolution Terrain - WhiteScreen0's Version
// @namespace    http://tampermonkey.net/
// @version      2026-04-16
// @description  Injects HD terrain with a 10-second safety delay
// @author       drakeerv (@WhiteScreen0 from youtube edited this to be compatible with Tampermonkey)
// @match        https://www.geo-fs.com/geofs.php?v=*
// @grant        none
// ==/UserScript==

// USE TAMPERMONKEY FIRST, CREATE NEW SCRIPT ON IT, AND COPY THIS AND PASTE IT IN THERE.

(function() {
    "use strict";

    function runInConsole() {
        console.log("GeoFS HD: Script injected! Waiting 10 seconds for the game to stabilize...");

        setTimeout(function() {
            console.log("GeoFS HD: 10 seconds passed. Applying modifications now.");

            const provider = "google";
            const multiplayerServer = "default";

            
            window.geofsNewHDState = true;

            
            if (window.geofs) {
                window.geofs.geoIpUpdate = function() {
                    console.log("GeoFS HD: geofs.geoIpUpdate triggered.");
                    delete window.geofs.api.analytics;
                    document.body.classList.add("geofs-hd");

                    if (multiplayerServer !== "default") {
                        window.geofs.multiplayerHost = multiplayerServer;
                    }

                    
                    if (window.Cesium) {
                        applyImagery(provider);
                    }
                };

                
                window.executeOnEventDone("geofsStarted", function() {
                    console.log("GeoFS HD: geofsStarted event detected.");
                    if (window.geofs.api.hdOn === window.geofsNewHDState) return;
                    window.jQuery("body").trigger("terrainProviderWillUpdate");
                    window.geofs.geoIpUpdate();
                    window.geofs.api.hdOn = window.geofsNewHDState;
                    window.geofs.api.renderingQuality();
                    window.jQuery("body").trigger("terrainProviderUpdate");
                });

                window.executeOnEventDone("afterDeferredload", function() {
                    window.geofs.mapXYZ = "https://data.geo-fs.com/osm/{z}/{x}/{y}.png";
                });
            } else {
                console.error("GeoFS HD Error: window.geofs object not found even after 10 seconds.");
            }

            
            function applyImagery(choice) {
                let newProvider;
                const cesium = window.Cesium;

                if (choice === "google") {
                    newProvider = new cesium.UrlTemplateImageryProvider({
                        maximumLevel: 21,
                        hasAlphaChannel: false,
                        subdomains: ["mt0", "mt1", "mt2", "mt3"],
                        url: "https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                    });
                }
                

                if (newProvider) {
                    window.geofs.api.imageryProvider = newProvider;
                    window.geofs.api.setImageryProvider(newProvider, false);
                }
            }

        }, 10000);
    }


    const script = document.createElement('script');
    script.textContent = '(' + runInConsole.toString() + ')();';
    (document.head || document.documentElement).appendChild(script);
    script.remove();

})();
