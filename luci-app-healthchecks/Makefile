include $(TOPDIR)/rules.mk

LUCI_TITLE:=Healthchecks.io
LUCI_PKGARCH:=all
PKG_NAME:=luci-app-healthchecks
PKG_VERSION:=0.2.0
PKG_RELEASE:=1

PKG_LICENSE:=MIT
PKG_MAINTAINER:=Jirah Cox <jirah@cox5.com>

include $(INCLUDE_DIR)/package.mk

define Package/luci-app-healthchecks
  SECTION:=luci
  CATEGORY:=LuCI
  SUBMENU:=3. Applications
  TITLE:=$(LUCI_TITLE)
  DEPENDS:=+healthchecks +luci-base
  PKGARCH:=all
endef

define Build/Compile
  # nothing to build
endef

define Package/luci-app-healthchecks/install
	# JS-based LuCI view
	$(INSTALL_DIR) $(1)/www/luci-static/resources/view/healthchecks
	$(INSTALL_DATA) ./htdocs/luci-static/resources/view/healthchecks/main.js \
		$(1)/www/luci-static/resources/view/healthchecks/main.js

	# Menu entry
	$(INSTALL_DIR) $(1)/usr/share/luci/menu.d
	$(INSTALL_DATA) ./root/usr/share/luci/menu.d/luci-app-healthchecks.json \
		$(1)/usr/share/luci/menu.d/luci-app-healthchecks.json

	# ACL permissions
	$(INSTALL_DIR) $(1)/usr/share/rpcd/acl.d
	$(INSTALL_DATA) ./root/usr/share/rpcd/acl.d/luci-app-healthchecks.json \
		$(1)/usr/share/rpcd/acl.d/luci-app-healthchecks.json
endef

# Same as LuCI's luci.mk: drop cached menus and let rpcd pick up the new ACL.
define Package/luci-app-healthchecks/postinst
[ -n "$${IPKG_INSTROOT}" ] || {
	rm -f /tmp/luci-indexcache.*
	rm -rf /tmp/luci-modulecache/
	/etc/init.d/rpcd reload 2>/dev/null
	exit 0
}
endef

$(eval $(call BuildPackage,luci-app-healthchecks))
