# Original author Kir Belevich https://github.com/svg/lmd-gui
#
# Author Mikhail Davydov http://azproduction.ru/
#

NODE-WEBKIT=v0.3.4

.PHONY: static
static:
	@echo rebuilding lmd-gui static...
	@cd app.nw; cat css/*.css > index.css
	@cd app.nw; lmd build index
	@echo done!

.PHONY: osx
osx: static
	@rm -rf osx/lmd-gui.app
	@echo downloading node-webkit engine...
	@curl -sSO http://s3.amazonaws.com/node-webkit/${NODE-WEBKIT}/node-webkit-${NODE-WEBKIT}-osx-ia32.zip
	@echo unpacking, renaming and copying files...
	@unzip -qq node-webkit-${NODE-WEBKIT}-osx-ia32.zip
	@rm node-webkit-${NODE-WEBKIT}-osx-ia32.zip
	@mv node-webkit.app osx/lmd-gui.app
	@mkdir osx/lmd-gui.app/Contents/Resources/app.nw/
	@ln app.nw/index.html osx/lmd-gui.app/Contents/Resources/app.nw/index.html
	@ln app.nw/index.css osx/lmd-gui.app/Contents/Resources/app.nw/index.css
	@ln app.nw/index.lmd.js osx/lmd-gui.app/Contents/Resources/app.nw/index.lmd.js
	@ln app.nw/package.json osx/lmd-gui.app/Contents/Resources/app.nw/package.json
#	@ln -f osx/app.icns osx/lmd-gui.app/Contents/Resources/app.icns
	@ln -f osx/Info.plist osx/lmd-gui.app/Contents/Info.plist
	@echo installing lmd module...
	@cd osx/lmd-gui.app/Contents/Resources/app.nw/; npm install &>/dev/null
	@echo done!
	@echo osx/lmd-gui.app is ready, changes in ./app.nw/ will automatically it.

.PHONY: linux
linux: static
	@rm -rf linux/
	@echo downloading node-webkit engine...
	@curl -sSO http://s3.amazonaws.com/node-webkit/${NODE-WEBKIT}/node-webkit-${NODE-WEBKIT}-linux-ia32.tar.gz
	@echo unpacking, renaming and copying files...
	@mkdir linux
	@cd linux; tar -xvf ../node-webkit-${NODE-WEBKIT}-linux-ia32.tar.gz --strip 1 > /dev/null 2>&1
	@rm node-webkit-${NODE-WEBKIT}-linux-ia32.tar.gz
	@echo installing lmd module...
	@cd app.nw/; npm install > /dev/null 2>&1
	@echo making application...
	@cd app.nw/; zip -0yrq ../linux/app.nw *.* node_modules/
	@cat linux/nw linux/app.nw > linux/lmd-gui
	@chmod +x linux/lmd-gui
	@rm linux/libffmpegsumo.so linux/nw linux/app.nw
	@echo done!
	@echo linux/lmd-gui app is ready, nw.pak must be shipped along with it.