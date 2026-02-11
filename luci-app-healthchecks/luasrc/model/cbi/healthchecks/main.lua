local m = Map("healthchecks", translate("Healthchecks.io"),
    translate("Configure the Healthchecks.io heartbeat client."))

local s = m:section(TypedSection, "healthchecks", translate("Main settings"))
s.anonymous = true
s.addremove = false

-- Enabled flag
local enabled = s:option(Flag, "enabled", translate("Enable"))
enabled.rmempty = false

-- Ping URL
local url = s:option(Value, "url", translate("Ping URL"),
    translate("Your full Healthchecks.io ping URL, e.g. 'https://hc-ping.com/your-uuid-here'."))
url.datatype = "string"
url.rmempty = false

-- Interval in minutes
local interval = s:option(Value, "interval_minutes", translate("Ping interval (minutes)"))
interval.datatype = "uinteger"
interval.default = "5"
interval.rmempty = false

return m
