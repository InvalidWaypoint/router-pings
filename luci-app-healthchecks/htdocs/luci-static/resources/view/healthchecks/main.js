'use strict';
'require view';
'require form';

// Same rule as /etc/init.d/healthchecks: https:// and a conservative character set.
var URL_PATTERN = /^https:\/\/[A-Za-z0-9._~:\/?=&%+-]+$/;

return view.extend({
    render: function() {
        var m, s, o;

        m = new form.Map('healthchecks', _('Healthchecks.io'),
            _('Sends a heartbeat to your Healthchecks.io check at a fixed interval. ' +
              'Changes take effect after Save & Apply.'));

        s = m.section(form.NamedSection, 'main', 'healthchecks');
        s.addremove = false;

        o = s.option(form.Flag, 'enabled', _('Enabled'));
        o.rmempty = false;

        o = s.option(form.Value, 'url', _('Ping URL'),
            _('Full https:// ping URL of your check. Treat it like a password.'));
        o.password = true;
        o.placeholder = 'https://hc-ping.com/your-uuid-here';
        o.validate = function(section_id, value) {
            if (value === '')
                return (this.section.formvalue(section_id, 'enabled') === '1')
                    ? _('Required while the service is enabled') : true;

            if (!URL_PATTERN.test(value))
                return _('Must be an https:// URL without spaces, quotes or brackets');

            return true;
        };

        o = s.option(form.Value, 'interval_minutes', _('Interval (minutes)'),
            _('Whole number from 1 to 1440.'));
        o.datatype = 'and(uinteger,range(1,1440))';
        o.default = '5';
        o.rmempty = false;

        o = s.option(form.Flag, 'verbose', _('Log every ping'),
            _('For troubleshooting. Normally only failures, recoveries and a 12-hour reminder are logged.'));
        o.rmempty = false;

        return m.render();
    }
});
