include $(TOPDIR)/rules.mk

PKG_NAME:=healthchecks
PKG_VERSION:=0.2.0
PKG_RELEASE:=1

PKG_LICENSE:=MIT
PKG_MAINTAINER:=Jirah Cox <jirah@cox5.com>


include $(INCLUDE_DIR)/package.mk

define Package/healthchecks
  SECTION:=net
  CATEGORY:=Network
  TITLE:=Healthchecks.io heartbeat client for OpenWrt
  URL:=https://healthchecks.io/
  DEPENDS:=+uclient-fetch +ca-bundle
  USERID:=healthchecks:healthchecks
  PKGARCH:=all
endef

define Package/healthchecks/description
A minimal client that periodically pings a Healthchecks.io URL from your router.
endef

define Package/healthchecks/conffiles
/etc/config/healthchecks
endef

define Build/Compile
	# nothing to build
endef

define Package/healthchecks/install
	$(INSTALL_DIR) $(1)/usr/bin
	$(INSTALL_BIN) ./files/usr/bin/healthchecks-ping $(1)/usr/bin/healthchecks-ping

	$(INSTALL_DIR) $(1)/etc/config
	$(INSTALL_CONF) ./files/etc/config/healthchecks $(1)/etc/config/healthchecks

	$(INSTALL_DIR) $(1)/etc/init.d
	$(INSTALL_BIN) ./files/etc/init.d/healthchecks $(1)/etc/init.d/healthchecks
endef

# default_postinst only starts the service, which leaves a running worker on
# the old code after an upgrade.
define Package/healthchecks/postinst
#!/bin/sh
[ -n "$${IPKG_INSTROOT}" ] || [ "$${PKG_UPGRADE}" != "1" ] || /etc/init.d/healthchecks restart
exit 0
endef

$(eval $(call BuildPackage,healthchecks))
