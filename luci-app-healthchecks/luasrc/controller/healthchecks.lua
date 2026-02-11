module("luci.controller.healthchecks", package.seeall)

local nixio = require("nixio")

function index()
    if not nixio.fs.access("/etc/config/healthchecks") then
        return
    end

    entry(
        {"admin", "services", "healthchecks"},
        cbi("healthchecks/main"),
        "Healthchecks.io",
        60
    ).dependent = true
end
