// main javascript file for the remote control page

var Remote = {
    currentMenu: "main-menu",
    types: ["string", "number", "boolean", "array", "object", "null", "undefined"],
    values: ["", 0.0, true, [], {}, null, undefined],
    validPositions: [
        "",
        "top_bar", "top_left", "top_center", "top_right",
        "upper_third",
        "middle_center",
        "lower_third",
        "bottom_left", "bottom_center", "bottom_right", "bottom_bar",
        "fullscreen_above",
        "fullscreen_below"
    ],
    savedData: {},
    translations: {},
    currentConfig: {},
    addModule: "",
    changedModules: [],
    deletedModules: [],
	autoHideTimer: undefined,
	autoHideDelay: 1000, // ms

    loadButtons: function(buttons) {
        for (var key in buttons) {
            if (buttons.hasOwnProperty(key)) {
                var element = document.getElementById(key);

                element.addEventListener("click", buttons[key], false);
            }
        }
    },

    loadTranslations: function() {
        var self = this;

        this.get("get", "data=translations", function (text) {
            self.translations = JSON.parse(text);
        });
    },

    translate: function(pattern) {
        return this.translations[pattern];
    },

    hasClass: function(element, name) {
        return (" " + element.className + " ").indexOf(" " + name + " ") > -1;
    },

    hide: function(element) {
        if (!this.hasClass(element, "hidden")) {
            element.className += " hidden";
        }
    },

    show: function(element) {
        if (this.hasClass(element, "hidden")) {
            element.className = element.className.replace(/ ?hidden/, "");
        }
    },

    loadToggleButton: function(element, toggleCallback) {
        var self = this;

        element.addEventListener("click", function (event) {
            if (self.hasClass(event.currentTarget, "toggled-off"))
            {
                if (toggleCallback) {
                    toggleCallback(true, event);
                }
            } else {
                if (toggleCallback) {
                    toggleCallback(false, event);
                }
            }
        }, false);
    },

    filter: function(pattern) {
        var filterInstalled = false;
        if ("installed".indexOf(pattern) !== -1) {
            filterInstalled = true;
            pattern = pattern.replace("installed");
        }
        pattern = pattern.trim();

        var regex = new RegExp(pattern, "i");
        var searchIn = ["author", "desc", "longname", "name"];

        var data = this.savedData.modulesAvailable;
        for (var i = 0; i < data.length; i++) {
            var currentData = data[i];
            var id = "install-module-" + i;
            var element = document.getElementById(id);
            if (pattern === "" || pattern === undefined) {
                // cleared search input, show all
                element.style.display = "";
                continue;
            }

            var match = false;
            if (filterInstalled && currentData.installed) {
                match = true;
            }
            for (var k = 0; k < searchIn.length; k++) {
                var key = searchIn[k];
                if (match || (currentData[key] && currentData[key].match(regex))) {
                    match = true;
                    break;
                }
            }
            if (match) {
                element.style.display = "";                
            } else {
                element.style.display = "none";
            }
        }
    },

    closePopup: function() {
        var popup = document.getElementById("popup-container");
        popup.style.display = "none";

        var popupContents = document.getElementById("popup-contents");
        while (popupContents.firstChild) {
            popupContents.removeChild(popupContents.firstChild);
        }
    },

    showPopup: function() {
        var popup = document.getElementById("popup-container");
        popup.style.display = "block";
    },

    getPopupContent: function(clear) {
        if (clear === undefined) {
            clear = true;
        }
        if (clear) {
            this.closePopup();
        }
        return document.getElementById("popup-contents");
    },

    loadOtherElements: function() {
        var self = this;

        var slider = document.getElementById("brightness-slider");
        slider.addEventListener("change", function(event) {
            self.getWithStatus("action=BRIGHTNESS&value=" + slider.value);
        }, false);

        var input = document.getElementById("add-module-search");
        var deleteButton = document.getElementById("delete-search-input");

        input.addEventListener("input", function(event) {
            self.filter(input.value);
            if (input.value === "") {
                deleteButton.style.display = "none";
            } else {
                deleteButton.style.display = "";
            }
        }, false);

        deleteButton.addEventListener("click", function(event) {
            input.value = "";
            self.filter(input.value);
            deleteButton.style.display = "none";
        }, false);
    },

    showMenu: function(newMenu) {
        var self = this;
        if (this.currentMenu === "settings-menu") {
            // check for unsaved changes
            var changes = this.deletedModules.length + this.changedModules.length;
            if (changes > 0) {
                var wrapper = document.createElement("div");
                var text = document.createElement("span");
                text.innerHTML = this.translate("UNSAVED_CHANGES");
                wrapper.appendChild(text);

                var ok = self.createSymbolText("fa fa-check-circle", this.translate("OK"), function () {
                    self.setStatus("none");
                });
                wrapper.appendChild(ok);

                var discard = self.createSymbolText("fa fa-warning", this.translate("DISCARD"), function () {
                    self.deletedModules = [];
                    self.changedModules = [];
                    window.location.hash = newMenu;
                });
                wrapper.appendChild(discard);

                this.setStatus(false, false, wrapper);

                this.skipHashChange = true;
                window.location.hash = this.currentMenu;

                return;
            }
        }

        var belowFold = document.getElementById("below-fold");
        if (newMenu === "main-menu") {
            if (!this.hasClass(belowFold, "hide-border")) {
                belowFold.className += " hide-border";
            }
        } else {
            if (this.hasClass(belowFold, "hide-border")) {
                belowFold.className = belowFold.className.replace(" hide-border", "");
            }
        }
        if (newMenu === "add-module-menu") {
            this.loadModulesToAdd();
        }
        if (newMenu === "edit-menu") {
            this.loadVisibleModules();
            this.loadBrightness();
        }
        if (newMenu === "settings-menu") {
            this.loadConfigModules();
        }
        if (newMenu === "update-menu") {
            this.loadModulesToUpdate();
        }
        var allMenus = document.getElementsByClassName("menu-element");

        for (var i = 0; i < allMenus.length; i++) {
            this.hide(allMenus[i]);
        }

        var currentMenu = document.getElementsByClassName(newMenu);

        for (var i = 0; i < currentMenu.length; i++) {
            this.show(currentMenu[i]);
        }

        this.setStatus("none");

        this.currentMenu = newMenu;
    },

    setStatus: function(status, message, customContent) {
        var self = this;

		if (this.autoHideTimer !== undefined) {
			clearTimeout(this.autoHideTimer);
		}

        var parent = document.getElementById("result-contents");
        while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }

        if (status === "none") {
            this.hide(document.getElementById("result-overlay"));
            this.hide(document.getElementById("result"));
            return;
        }

        if (customContent) {
            parent.appendChild(customContent);
            this.show(document.getElementById("result-overlay"));
            this.show(document.getElementById("result"));
            return;
        }

        var symbol;
        var text;
        var close = true;
        if (status === "loading") {
            symbol = "fa-spinner fa-pulse";
            text = this.translate("LOADING");
            onClick = false;
        }
        if (status === "error") {
            symbol = "fa-exclamation-circle";
            text = this.translate("ERROR");
            onClick = false;
        }
        if (status === "success") {
            symbol = "fa-check-circle";
            text = this.translate("DONE");
            onClick = function() {
                self.setStatus("none");
            };
			this.autoHideTimer = setTimeout(function() {
				self.setStatus("none");
			}, this.autoHideDelay);
        }
        if (message) {
            text = message;
        }
        parent.appendChild(this.createSymbolText("fa fa-fw " + symbol, text, onClick));

        this.show(document.getElementById("result-overlay"));
        this.show(document.getElementById("result"));
    },

    getWithStatus: function(params, callback) {
        var self = this;

        self.setStatus("loading");
        self.get("remote", params, function (response) {
            if (callback) {
                callback(response);
            } else {
                var result = JSON.parse(response);
                if (result.status === "success") {
                    if (result.info){
                        self.setStatus("success", result.info);
                    } else {
                        self.setStatus("success");
                    }
                } else {
                    self.setStatus("error");
                }
            }
        });
    },

    showModule: function(id, force) {
        if (force) {
            this.getWithStatus("action=SHOW&force=true&module=" + id);
        } else {
            this.getWithStatus("action=SHOW&module=" + id);
        }
    },

    hideModule: function(id) {
        this.getWithStatus("action=HIDE&module=" + id);
    },

    install: function(url, index) {
        var self = this;

        var downloadButton = document.getElementById("download-button");
        var symbol = downloadButton.children[0];
        var text = downloadButton.children[1];
        symbol.className = "fa fa-fw fa-spinner fa-pulse";
        text.innerHTML = " " + self.translate("DOWNLOADING");

        self.get("remote", "action=INSTALL&url=" + url, function (response) {
            var result = JSON.parse(response);
            if (result.status === "success") {
                var bgElement = document.getElementById("install-module-" + index);
                bgElement.firstChild.className = "fa fa-fw fa-check-circle";
                self.savedData.modulesAvailable[index].installed = true;
                self.createAddingPopup(index);
            } else {
                symbol.className = "fa fa-fw fa-exclamation-circle";
                text.innerHTML = " " + self.translate("ERROR");
            }
        });
    },

    get: function(route, params, callback, timeout) {
        var req = new XMLHttpRequest();
        var url = route + "?" + params;
        req.open("GET", url, true);

        if (timeout) {
            req.timeout = timeout; // time in milliseconds
        }

        //Send the proper header information along with the request
        req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        req.onreadystatechange = function() {
            if(req.readyState == 4 && req.status == 200) {
                if (callback)
                {
                    callback(req.responseText);
                }
            }
        }
        req.send(null);
    },

    post: function(route, params, data, callback, timeout) {
        var req = new XMLHttpRequest();
        var url = route + "?" + params;
        req.open("POST", url, true);
        req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        req.onreadystatechange = function () { 
            if (req.readyState == 4 && req.status == 200) {
                if (callback)
                {
                    callback(JSON.parse(req.responseText));
                }
            }
        };
        req.send(JSON.stringify(data));
    },

    loadList: function(listname, dataId, callback) {
        var self = this;

        var loadingIndicator = document.getElementById(listname + "-loading");
        var emptyIndicator = document.getElementById(listname + "-empty");
        var parent = document.getElementById(listname + "-results");

        while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }
        self.show(loadingIndicator);

        this.get("get", "data=" + dataId, function (text) {
            self.hide(loadingIndicator);
            self.savedData[dataId] = false;

            try {
                var data = JSON.parse(text);

                if (data.length === 0) {
                    self.show(emptyIndicator);
                } else {
                    self.hide(emptyIndicator);
                }
                self.savedData[dataId] = data;
                callback(parent, data);
            } catch (e) {
                self.show(emptyIndicator);
            }
        });
    },

    formatName: function(string) {
        string = string.replace(/MMM?-/ig, "").replace(/_/g, " ").replace(/-/g, " ");
        string = string.replace(/([a-z])([A-Z])/g, function(txt){
            // insert space into camel case
            return txt.charAt(0) + " " + txt.charAt(1);
        });
        string = string.replace(/\w\S*/g, function(txt){
            // make character after white space upper case
            return txt.charAt(0).toUpperCase() + txt.substr(1);
        });
        return string.charAt(0).toUpperCase() + string.slice(1);
    },

    formatLabel: function(string) {
        // var result = string.replace(/([A-Z])/g, " $1" );
        // return result.charAt(0).toUpperCase() + result.slice(1);
        return string;
    },

    formatPosition: function(string) {
        return string.replace("_", " ").replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    },

    getVisibilityStatus: function(data) {
        var status = "toggled-on";
        var modules = [];
        if (data.hidden) {
            status = "toggled-off";
            for (var i = 0; i < data.lockStrings.length; i++) {
                if (data.lockStrings[i].indexOf("MMM-Remote-Control") >= 0)
                {
                    continue;
                }
                modules.push(data.lockStrings[i]);
                if (modules.length == 1)
                {
                    status += " external-locked";
                }
            }
        }
        return {status: status, modules: modules.join(", ")};
    },

    addToggleElements: function(parent) {
        var outerSpan = document.createElement("span");
        outerSpan.className = "stack fa-fw";

        spanClasses = [
            "fa fa-fw fa-toggle-on outer-label fa-stack-1x",
            "fa fa-fw fa-toggle-off outer-label fa-stack-1x",
            "fa fa-fw fa-lock inner-small-label fa-stack-1x"
        ];

        for (var i = 0; i < spanClasses.length; i++) {
            var innerSpan = document.createElement("span");
            innerSpan.className = spanClasses[i];
            outerSpan.appendChild(innerSpan);
        }

        parent.appendChild(outerSpan);
    },

    loadBrightness: function () {
        var self = this;

        console.log("Load brightness...");

        this.get("get", "data=brightness", function (text) {
            var slider = document.getElementById("brightness-slider");

            slider.value = JSON.parse(text);
        });
    },

    makeToggleButton: function(moduleBox, visibilityStatus)
    {
        var self = this;

        self.loadToggleButton(moduleBox, function (toggledOn, event) {
            if (toggledOn) {
                if (self.hasClass(event.currentTarget, "external-locked")) {
                    var wrapper = document.createElement("div");
                    var warning = document.createElement("span");
                    warning.innerHTML = self.translate("LOCKSTRING_WARNING").replace("LIST_OF_MODULES", visibilityStatus.modules);
                    wrapper.appendChild(warning);

                    var ok = self.createSymbolText("fa fa-check-circle", self.translate("OK"), function () {
                        self.setStatus("none");
                    });
                    wrapper.appendChild(ok);

                    var force = self.createSymbolText("fa fa-warning", self.translate("FORCE_SHOW"), function(target) {
                        return function () {
                            target.className = target.className.replace(" external-locked", "").replace("toggled-off", "toggled-on");
                            self.showModule(target.id, true);
                            self.setStatus("none");
                        }
                    }(event.currentTarget));
                    wrapper.appendChild(force);

                    self.setStatus("error", false, wrapper);
                } else {
                    event.currentTarget.className = event.currentTarget.className.replace("toggled-off", "toggled-on");
                    self.showModule(event.currentTarget.id);
                }
            } else {
                event.currentTarget.className = event.currentTarget.className.replace("toggled-on", "toggled-off");
                self.hideModule(event.currentTarget.id);
            }
        });
    },

    loadVisibleModules: function() {
        var self = this;

        console.log("Load visible modules...");

        this.loadList("visible-modules", "modules", function (parent, moduleData) {
            for (var i = 0; i < moduleData.length; i++) {
                if (!moduleData[i]["position"]) {
                    // skip invisible modules
                    continue;
                }
                var visibilityStatus = self.getVisibilityStatus(moduleData[i]);

                var moduleBox = document.createElement("div");
                moduleBox.className = "button module-line " + visibilityStatus.status;
                moduleBox.id = moduleData[i].identifier;

                self.addToggleElements(moduleBox);

                var text = document.createElement("span");
                text.className = "text";
                text.innerHTML = " " + self.formatName(moduleData[i].name);
                moduleBox.appendChild(text);

                parent.appendChild(moduleBox);

                self.makeToggleButton(moduleBox, visibilityStatus);
            }
        });
    },

    createSymbolText: function(symbol, text, eventListener, element) {
        if (element === undefined) {
            element = "div";
        }
        var wrapper = document.createElement(element);
        if (eventListener) {
            wrapper.className = "button";
        }
        var symbolElement = document.createElement("span");
        symbolElement.className = symbol;
        wrapper.appendChild(symbolElement);
        var textElement = document.createElement("span");
        textElement.innerHTML = text;
        textElement.className = "symbol-text-padding";
        wrapper.appendChild(textElement);
        if (eventListener) {
            wrapper.addEventListener("click", eventListener, false);
        }
        return wrapper
    },

    recreateConfigElement: function (key, previousType, newType) {
        var input = document.getElementById(key);
        var oldGUI = input.parentNode;
        if (previousType === "array" || previousType === "object") {
            oldGUI = input;
        }
        var path = key.split("/");
        var name = path[path.length - 1];

        var current = this.currentConfig;
        for (var i = 1; i < path.length - 1; i++) {
            current = current[path[i]];
        }
        var initialValue = this.values[this.types.indexOf(newType)];
        var newGUI = this.createObjectGUI(key, name, initialValue);
        oldGUI.parentNode.replaceChild(newGUI, oldGUI);
    },

    createTypeEditSelection: function (key, parent, type, oldElement) {
        var self = this;

        var previousType = oldElement.children[1].innerHTML.slice(1).toLowerCase();
        var select = document.createElement("select")
        for (var i = 0; i < this.types.length; i++) {
            var option = document.createElement("option");
            option.innerHTML = this.formatName(this.types[i]);
            option.value = this.types[i];
            if (this.types[i] === type) {
                option.selected = "selected";
            }
            select.appendChild(option);
        }
        select.addEventListener("change", function (event) {
            var newType = select.options[select.selectedIndex].innerHTML.toLowerCase();
            if (previousType !== newType) {
                self.recreateConfigElement(key, previousType, newType);
            } else {
                parent.replaceChild(oldElement, select);
            }
        }, false);
        select.addEventListener("blur", function (event) {
            parent.replaceChild(oldElement, select);
        }, false);
        return select
    },

    createConfigLabel: function (key, name, type, forcedType, symbol) {
        var self = this;

        if (symbol === undefined) {
            symbol = "fa-tag";
        }
        if (name[0] === "#") {
            symbol = "fa-hashtag";
            name = name.substring(1);
        }
        var label = document.createElement("label");
        label.htmlFor = key;
        label.className = "config-label";
        var desc = Remote.createSymbolText("fa fa-fw " + symbol, this.formatLabel(name), false, "span");
        desc.className = "label-name";
        label.appendChild(desc);

        if (!forcedType) {
            var typeLabel = Remote.createSymbolText("fa fa-fw fa-pencil", this.formatName(type), function (event) {
                var thisElement = event.currentTarget;
                label.replaceChild(self.createTypeEditSelection(key, label, type, thisElement), thisElement);
            }, "span");
            typeLabel.className += " type-edit";
            label.appendChild(typeLabel);

            var remove = Remote.createSymbolText("fa fa-fw fa-times-circle", this.translate("DELETE_ENTRY"), function (event) {
                var thisElement = event.currentTarget;
                if (type === "array" || type === "object") {
                    thisElement = thisElement.parentNode;
                }
                thisElement.parentNode.parentNode.removeChild(thisElement.parentNode);
            }, "span");
            remove.className += " type-edit";
            label.appendChild(remove);
        }
        return label;
    },

    createConfigInput: function (key, value, omitValue, element) {
        if (element === undefined) {
            element = "input";
        }
        var input = document.createElement(element);
        input.className = "config-input";
        if (!omitValue) {
            input.value = value;
        }
        input.id = key;
        input.addEventListener("focus", function (event) {
            var label = event.currentTarget.parentNode;
            label.className = label.className + " highlight";
        }, false);
        input.addEventListener("blur", function (event) {
            var label = event.currentTarget.parentNode;
            label.className = label.className.replace(" highlight", "");
        }, false);

        return input;
    },

    createVisualCheckbox: function (key, wrapper, input, className, value) {
        var visualCheckbox = document.createElement("span");
        visualCheckbox.className = "visual-checkbox fa fa-fw " + className;
        wrapper.appendChild(visualCheckbox);
    },

    createConfigElement: function (type) {
        var self = this;

        return {
            string: function(key, name, value, type, forcedType) {
                var label = self.createConfigLabel(key, name, type, forcedType);
                var input = self.createConfigInput(key, value);
                input.type = "text";
                label.appendChild(input);
                if (key === "<root>/header") {
                    input.placeholder = self.translate("NO_HEADER");
                }
                return label;
            },
            number: function(key, name, value, type, forcedType) {
                var label = self.createConfigLabel(key, name, type, forcedType);
                var input = self.createConfigInput(key, value);
                input.type = "number";
                if (value % 1 !== 0) {
                    input.step = 0.01;
                }
                label.appendChild(input);
                return label;
            },
            boolean: function(key, name, value, type, forcedType) {
                var label = self.createConfigLabel(key, name, type, forcedType);

                var input = self.createConfigInput(key, value, true);
                input.type = "checkbox";
                label.appendChild(input);
                console.log(value);
                if (value) {
                    input.checked = true;
                    console.log(input.checked);
                }

                self.createVisualCheckbox(key, label, input, "fa-check-square-o", false);
                self.createVisualCheckbox(key, label, input, "fa-square-o", true);
                return label;
            },
            undefined: function(key, name, value, type, forcedType) {
                var label = self.createConfigLabel(key, name, type, forcedType);
                var input = self.createConfigInput(key, value);
                input.type = "text";
                input.disabled = "disabled";
                input.className += " disabled undefined";
                input.placeholder = "undefined";
                label.appendChild(input);
                return label;
            },
            null: function(key, name, value, type, forcedType) {
                var label = self.createConfigLabel(key, name, type, forcedType);
                var input = self.createConfigInput(key, value);
                input.type = "text";
                input.disabled = "disabled";
                input.className += " disabled null";
                input.placeholder = "null";
                label.appendChild(input);
                return label;
            },
            position: function(key, name, value, type, forcedType) {
                var label = self.createConfigLabel(key, name, type, forcedType);
                var select = self.createConfigInput(key, value, false, "select");
                select.className = "config-input";
                select.id = key;
                for (var i = 0; i < self.validPositions.length; i++) {
                    var option = document.createElement("option");
                    option.value = self.validPositions[i];
                    if (self.validPositions[i]) {
                        option.innerHTML = self.formatPosition(self.validPositions[i]);
                    } else {
                        option.innerHTML = self.translate("NO_POSITION");
                    }
                    if (self.validPositions[i] === value) {
                        option.selected = "selected";
                    }
                    select.appendChild(option);
                }
                label.appendChild(select);
                return label;
            }
        }[type]
    },

    getTypeAsString: function(dataToEdit, path) {
        var type = typeof dataToEdit;
        if (path === "<root>/position") {
            type = "position";
        }
        if (this.createConfigElement(type)) {
            return type;
        }
        if (Array.isArray(dataToEdit)) {
            return "array";
        }
        if (dataToEdit === null) {
            return "null";
        }
        if (dataToEdit === undefined) {
            return "undefined";
        }
        return "object";
    },

    hasForcedType: function(path) {
        var forcedType = false;
        if ((path.match(/\//g) || []).length === 1) {
            // disable type editing in root layer
            forcedType = true;
        }
        return forcedType;
    },

    createObjectGUI: function(path, name, dataToEdit) {
        var self = this;

        var type = this.getTypeAsString(dataToEdit, path);
        var forcedType = this.hasForcedType(path);
        if (this.createConfigElement(type)) {
            // recursion stop
            return this.createConfigElement(type)(path, name, dataToEdit, type, forcedType);
        }

        // object and array
        var wrapper = document.createElement("div");
        wrapper.id = path;
        wrapper.className = "indent config-input " + type;
        if (type === "array") {
            // array
            var add = this.createSymbolText("fa fa-fw fa-plus", this.translate("ADD_ENTRY"));
            add.className += " bottom-spacing button";
            wrapper.appendChild(this.createConfigLabel(path, name, type, forcedType, "fa-list-ol"));
            wrapper.appendChild(add);
            for (var i = 0; i < dataToEdit.length; i++) {
                var newName = "#" + i;
                wrapper.appendChild(this.createObjectGUI(path + "/" + newName, newName, dataToEdit[i]));
            }
            add.addEventListener("click", function () {
                var lastIndex = dataToEdit.length - 1;
                var lastType = self.getTypeAsString(path + "/#" + lastIndex, dataToEdit[lastIndex]);
                dataToEdit.push(self.values[self.types.indexOf(lastType)]);
                var nextName = "#" + (lastIndex + 1);
                wrapper.appendChild(self.createObjectGUI(path + "/" + nextName, nextName, dataToEdit[dataToEdit.length - 1]));
            }, false);
            return wrapper;
        }

        // object
        if (path !== "<root>") {
            wrapper.appendChild(this.createConfigLabel(path, name, type, forcedType, "fa-list-ul"));

            var addElement = self.createConfigLabel(path + "/<add>", this.translate("ADD_ENTRY"), type, true, "fa-plus");
            addElement.className += " bottom-spacing";
            var inputWrapper = document.createElement("div");
            inputWrapper.className = "add-input-wrapper";
            var input = self.createConfigInput(path + "/<add>", "");
            input.type = "text";
            input.placeholder = this.translate("NEW_ENTRY_NAME");
            addElement.appendChild(inputWrapper);
            inputWrapper.appendChild(input);
            var addFunction = function () {
                    var existingKey = Object.keys(dataToEdit)[0];
                    var lastType = self.getTypeAsString(path + "/" + existingKey, dataToEdit[existingKey]);
                    var key = input.value;
                    if (key === "" || document.getElementById(path + "/" + key)) {
                        if (!self.hasClass(input, "input-error")) {
                            input.className += " input-error";
                        }
                        return;
                    }
                    input.className = input.className.replace(" input-error", "");
                    dataToEdit[key] = self.values[self.types.indexOf(lastType)];
                    var newElement = self.createObjectGUI(path + "/" + key, key, dataToEdit[key]);
                    wrapper.insertBefore(newElement, addElement.nextSibling);
                    input.value = "";
            };
            var symbol = document.createElement("span");
            symbol.className = "fa fa-fw fa-plus-square button";
            symbol.addEventListener("click", addFunction, false);
            inputWrapper.appendChild(symbol);
            input.onkeypress = function(e){
                if (!e) e = window.event;
                var keyCode = e.keyCode || e.which;
                if (keyCode == "13"){
                    addFunction();
                }
            }
            wrapper.appendChild(addElement);
        }
        var keys = Object.keys(dataToEdit);
        if (path === "<root>") {
            keys = ["module", "disabled", "position", "header", "config"];
        }
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (dataToEdit.hasOwnProperty(key)) {
                wrapper.appendChild(this.createObjectGUI(path + "/" + key, key, dataToEdit[key]));
            }
        }            
        if (path === "<root>") {
            // additional css classes on root element
            wrapper.className = "flex-fill small";
        }
        return wrapper;
    },

    appendConfigMenu: function(index, wrapper) {
        var self = this;

        var menuElement = self.createSymbolText("small fa fa-fw fa-navicon", self.translate("MENU"), function (event) {
            var elements = document.getElementsByClassName("sub-menu");
            for (var i = 0; i < elements.length; i++) {
                var element = elements[i];
                if (self.hasClass(element, "hidden")) {
                    element.className = element.className.replace("hidden", "");
                } else {
                    element.className = element.className + " hidden";
                }
            }
        });
        menuElement.className += " fixed-size";
        wrapper.appendChild(menuElement);

        var menuDiv = document.createElement("div");
        menuDiv.className = "fixed-size sub-menu hidden";

        var help = self.createSymbolText("fa fa-fw fa-question-circle", self.translate("HELP"), function (event) {
            window.open("config-help.html?module=" + self.currentConfig.module, "_blank");
        });
        menuDiv.appendChild(help);
        var undo = self.createSymbolText("fa fa-fw fa-undo", self.translate("RESET"), function (event) {
            self.createConfigPopup(index);
        });
        menuDiv.appendChild(undo);
        var save = self.createSymbolText("fa fa-fw fa-save", self.translate("SAVE"), function (event) {
            self.savedData["config"].modules[index] = self.getModuleConfigFromUI();
            self.changedModules.push(index);
            var parent = document.getElementById("edit-module-" + index).parentNode;
            if (parent.children.length === 2) {
                parent.insertBefore(self.createChangedWarning(), parent.children[1]);               
            }
            self.closePopup();
        });
        menuDiv.appendChild(save);

        wrapper.appendChild(menuDiv);

        var line = document.createElement("header");
        line.className = "header";
        wrapper.appendChild(line);
    },

    setValue: function(parent, name, value) {
        if (name.indexOf("#") !== -1) {
            parent.push(value);
        } else {
            parent[name] = value;
        }
    },

    navigate: function(parent, name) {
        if (name.indexOf("#") !== -1) {
            return parent[parent.length - 1];
        } else {
            return parent[name];
        }
    },

    getModuleConfigFromUI: function() {
        var rootElement = {};
        var elements = document.getElementsByClassName("config-input");
        for (var i = 0; i < elements.length; i++) {
            var path = elements[i].id;
            var splitPath = path.split("/");
            var parent = rootElement;
            for (var k = 1; k < splitPath.length - 1; k++) {
                parent = this.navigate(parent, splitPath[k]);
            }
            var name = splitPath[k];
            if (this.hasClass(elements[i], "null")) {
                this.setValue(parent, name, null);
                continue;
            }
            if (this.hasClass(elements[i], "undefined")) {
                this.setValue(parent, name, undefined);
                continue;
            }
            if (this.hasClass(elements[i], "array")) {
                this.setValue(parent, name, []);
                continue;
            }
            if (this.hasClass(elements[i], "object")) {
                this.setValue(parent, name, {});
                continue;
            }

            var value = elements[i].value;
            if (name === "<add>" || (path === "<root>/position" && value === "")) {
                continue;
            }
            if (elements[i].type === "checkbox")
            {
                value = elements[i].checked;
            }
            if (elements[i].type === "number")
            {
                value = parseFloat(value);
            }
            this.setValue(parent, name, value);
        }
        return rootElement;
    },

    createConfigPopup: function(index) {
        var self = this;
        if (typeof index === "string") {
            index = parseInt(index);
        }

        var moduleData = this.savedData["config"].modules;
        var data = moduleData[index];

        self.currentConfig = data;
        if (!("header" in self.currentConfig)) {
            self.currentConfig.header = "";
        }
        if (!("position" in self.currentConfig)) {
            self.currentConfig.position = "";
        }

        var wrapper = this.getPopupContent();

        var name = document.createElement("div");
        name.innerHTML = self.formatName(data.module);
        name.className = "bright title medium";
        wrapper.appendChild(name);

        var name = document.createElement("div");
        name.innerHTML = data.module + " (#" + (index + 1) + ")";
        name.className = "subtitle xsmall dimmed";
        wrapper.appendChild(name);

        self.appendConfigMenu(index, wrapper);

        wrapper.append(self.createObjectGUI("<root>", "", self.currentConfig));

        // disable input for module name
        document.getElementById("<root>/module").disabled = true;
        document.getElementById("<root>/module").className += " disabled";

        this.showPopup();
    },

    createChangedWarning: function() {
        var self = this;
        var changed = Remote.createSymbolText("fa fa-fw fa-warning", this.translate("UNSAVED_CHANGES"), function() {
            var saveButton = document.getElementById("save-config");
            if (!self.hasClass(saveButton, "highlight")) {
                saveButton.className += " highlight";
            }
        }, "span");
        changed.className += " type-edit";
        return changed;
    },

    appendModuleEditElements: function(wrapper, moduleData) {
        var self = this;
        for (var i = 0; i < moduleData.length; i++) {
            var innerWrapper = document.createElement("div");
            innerWrapper.className = "module-line";

            var moduleBox = self.createSymbolText("fa fa-fw fa-pencil", self.formatName(moduleData[i].module), function(event) {
                var i = event.currentTarget.id.replace("edit-module-", "");
                self.createConfigPopup(i);
            }, "span");
            moduleBox.id = "edit-module-" + i;
            innerWrapper.appendChild(moduleBox);

            if (self.changedModules.indexOf(i) !== -1) {
                innerWrapper.appendChild(self.createChangedWarning());
            }

            var remove = Remote.createSymbolText("fa fa-fw fa-times-circle", this.translate("DELETE_ENTRY"), function (event) {
                var i = event.currentTarget.parentNode.firstChild.id.replace("edit-module-", "");
                self.deletedModules.push(parseInt(i));
                var thisElement = event.currentTarget;
                thisElement.parentNode.parentNode.removeChild(thisElement.parentNode);
            }, "span");
            remove.className += " type-edit";
            innerWrapper.appendChild(remove);

            wrapper.appendChild(innerWrapper);
        }
    },

    loadConfigModules: function() {
        var self = this;

        console.log("Loading modules in config...");
        this.changedModules = []

        this.loadList("config-modules", "config", function (parent, configData) {
            var moduleData = configData.modules;
            if (self.addModule) {
                var name = self.addModule;
                // we came here from adding a module
                self.get("get", "data=defaultConfig&module=" + name, function(response) {
                    var newData = JSON.parse(response);
                    moduleData.push({module: name, config: newData});
                    var index = moduleData.length - 1;
                    self.changedModules.push(index);
                    self.appendModuleEditElements(parent, moduleData);
                    self.createConfigPopup(index);
                });
                self.addModule = "";
            } else {
                self.appendModuleEditElements(parent, moduleData);
            }
        });
    },

    createAddingPopup: function(index) {
        var self = this;
        if (typeof index === "string") {
            index = parseInt(index);
        }

        var data = this.savedData["modulesAvailable"][index];
        var wrapper = this.getPopupContent();

        var name = document.createElement("div");
        name.innerHTML = data.name;
        name.className = "bright title";
        wrapper.appendChild(name);

        var author = document.createElement("div");
        author.innerHTML = self.translate("BY") + " " + data.author;
        author.className = "subtitle small";
        wrapper.appendChild(author);

        var desc = document.createElement("div");
        desc.innerHTML = data.desc;
        desc.className = "small flex-fill";
        wrapper.appendChild(desc);

        var footer = document.createElement("div");
        footer.className = "fixed-size sub-menu";

        if (data.installed) {
            var add = self.createSymbolText("fa fa-fw fa-plus", self.translate("ADD_THIS"), function (event) {
                self.closePopup();
                self.addModule = data.longname;
                window.location.hash = "settings-menu";
            });
            footer.appendChild(add);
        }

        if (data.installed) {
            var statusElement = self.createSymbolText("fa fa-fw fa-check-circle", self.translate("INSTALLED"));
            footer.appendChild(statusElement);
        } else {
            var statusElement = self.createSymbolText("fa fa-fw fa-download", self.translate("DOWNLOAD"), function (event) {
                self.install(data.url, index);
            });
            statusElement.id = "download-button";
            footer.appendChild(statusElement);
        }

        var githubElement = self.createSymbolText("fa fa-fw fa-github", self.translate("CODE_LINK"), function (event) {
            window.open(data.url, "_blank");
        });
        footer.appendChild(githubElement);

        wrapper.appendChild(footer);

        this.showPopup();
    },

    loadModulesToAdd: function() {
        var self = this;

        console.log("Loading modules to add...");

        this.loadList("add-module", "modulesAvailable", function (parent, modules) {
            for (var i = 0; i < modules.length; i++) {
                var symbol = "fa fa-fw fa-cloud";
                if (modules[i].installed) {
                    symbol = "fa fa-fw fa-check-circle";
                }

                var moduleBox = self.createSymbolText(symbol, modules[i].name, function (event) {
                    var index = event.currentTarget.id.replace("install-module-", "");
                    self.createAddingPopup(index);
                });
                moduleBox.className = "button module-line";
                moduleBox.id = "install-module-" + i;
                parent.appendChild(moduleBox);
            }
        });
    },

    offerRestart: function(message) {
        var wrapper = document.createElement("div");

        var info = document.createElement("span");
        info.innerHTML = message;
        wrapper.appendChild(info);

        var restart = this.createSymbolText("fa fa-fw fa-recycle", this.translate("RESTARTMM"), buttons["restart-mm-button"]);
        restart.children[1].className += " text";
        wrapper.appendChild(restart);
        this.setStatus("success", false, wrapper);
    },

    updateModule: function(module) {
        var self = this;

        self.getWithStatus("action=UPDATE&module=" + module, function(response) {
            var result = JSON.parse(response);
            if (result.status === "success") {
                if (result.code === "restart") {
                    self.offerRestart(result.info);
                } else {
                    self.setStatus("success", result.info);
                }
            } else {
                self.setStatus("error");
            }
        });
    },

    loadModulesToUpdate: function() {
        var self = this;

        console.log("Loading modules to update...");

        // also update mm info notification
        this.get("get", "data=mmUpdateAvailable", function(result) {
            if (window.location.hash.substring(1) == "update-menu")
            {
                var updateAvailable = JSON.parse(result);
                var element = document.getElementById("update-mm-status");
                var updateButton = document.getElementById("update-mm-button");
                if (updateAvailable) {
                    self.show(element);
                    updateButton.className += " bright";
                } else {
                    self.hide(element);
                    updateButton.className = updateButton.className.replace(" bright", "");
                }
            }
        });

        this.loadList("update-module", "modulesInstalled", function (parent, modules) {
            for (var i = 0; i < modules.length; i++) {
                var symbol = "fa fa-fw fa-toggle-up";
                var innerWrapper = document.createElement("div");
                innerWrapper.className = "module-line";

                var moduleBox = self.createSymbolText(symbol, modules[i].name, function (event) {
                    var module = event.currentTarget.id.replace("update-module-", "");
                    self.updateModule(module);
                });
                moduleBox.className = "button";
                if (modules[i].updateAvailable) {
                    moduleBox.className += " bright";
                }
                moduleBox.id = "update-module-" + modules[i].longname;
                innerWrapper.appendChild(moduleBox);

                if (modules[i].updateAvailable) {
                    var moduleBox = self.createSymbolText("fa fa-fw fa-info-circle", self.translate("UPDATE_AVAILABLE"));
                    innerWrapper.appendChild(moduleBox);
                }

                parent.appendChild(innerWrapper);
            }
        });
    },

    saveConfig: function() {
        var self = this;

        // prevent saving before current saving is finished
        if (this.saving) {
            return;
        }
        var saveButton = document.getElementById("save-config");
        saveButton.className = saveButton.className.replace(" highlight", "");
        this.saving = true;
        this.setStatus("loading");
        var configData = this.savedData["config"];
        var remainingModules = [];
        for (var i = 0; i < configData.modules.length; i++) {
            if (this.deletedModules.indexOf(i) !== -1) {
                continue;
            } else {
                remainingModules.push(configData.modules[i]);
            }
        }
        configData.modules = remainingModules;
        this.deletedModules = [];
        this.post("post", "data=config", configData, function (result) {
            if (result.status === "success") {
                self.offerRestart(self.translate("DONE"));
            } else {
                self.setStatus("error");
            }
            self.saving = false;
            self.loadConfigModules();
        });
    }
};

var buttons = {
    // navigation buttons
    "power-button": function() {
        window.location.hash = "power-menu";
    },
    "edit-button": function() {
        window.location.hash = "edit-menu";
    },
    "settings-button": function() {
        var self = Remote;

        var wrapper = document.createElement("div");
        var text = document.createElement("span");
        text.innerHTML = self.translate("EXPERIMENTAL");
        wrapper.appendChild(text);

        var panic = self.createSymbolText("fa fa-life-ring", self.translate("PANIC"), function () {
            self.setStatus("none");
        });
        wrapper.appendChild(panic);

        var danger = self.createSymbolText("fa fa-warning", self.translate("NO_RISK_NO_FUN"), function () {
            window.location.hash = "settings-menu";
        });
        wrapper.appendChild(danger);

        self.setStatus(false, false, wrapper);
    },
    "mirror-link-button": function() {
        window.open("/", "_blank");
    },
    "back-button": function() {
        if (window.location.hash === "#add-module-menu") {
            window.location.hash = "settings-menu";
            return;
        }
        window.location.hash = "main-menu";
    },
    "update-button": function () {
        window.location.hash = "update-menu";
    },
    "alert-button": function () {
        window.location.hash = "alert-menu";
    },

    // settings menu buttons
    "brightness-reset": function() {
        var element = document.getElementById("brightness-slider");
        element.value = 100;
        Remote.getWithStatus("action=BRIGHTNESS&value=100");
    },

    // edit menu buttons
    "show-all-button": function() {
        var parent = document.getElementById("visible-modules-results");
        var buttons = parent.children;
        for (var i = 0; i < buttons.length; i++) {
            if (Remote.hasClass(buttons[i], "external-locked")) {
                continue;
            }
            buttons[i].className = buttons[i].className.replace("toggled-off", "toggled-on");
            Remote.showModule(buttons[i].id);
        }
    },
    "hide-all-button": function() {
        var parent = document.getElementById("visible-modules-results");
        var buttons = parent.children;
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].className = buttons[i].className.replace("toggled-on", "toggled-off");
            Remote.hideModule(buttons[i].id);
        }
    },

    // power menu buttons
    "shut-down-button": function() {
        var self = Remote;

        var wrapper = document.createElement("div");
        var text = document.createElement("span");
        text.innerHTML = self.translate("CONFIRM_SHUTDOWN");
        wrapper.appendChild(text);

        var ok = self.createSymbolText("fa fa-power-off", self.translate("SHUTDOWN"), function () {
            Remote.getWithStatus("action=SHUTDOWN");
        });
        wrapper.appendChild(ok);

        var cancel = self.createSymbolText("fa fa-times", self.translate("CANCEL"), function () {
            self.setStatus("none");
        });
        wrapper.appendChild(cancel);

        self.setStatus(false, false, wrapper);
    },
    "restart-button": function() {
        var self = Remote;

        var wrapper = document.createElement("div");
        var text = document.createElement("span");
        text.innerHTML = self.translate("CONFIRM_RESTART");
        wrapper.appendChild(text);

        var ok = self.createSymbolText("fa fa-refresh", self.translate("RESTART"), function () {
                Remote.getWithStatus("action=REBOOT");
        });
        wrapper.appendChild(ok);

        var cancel = self.createSymbolText("fa fa-times", self.translate("CANCEL"), function () {
            self.setStatus("none");
        });
        wrapper.appendChild(cancel);

        self.setStatus(false, false, wrapper);
    },
    "restart-mm-button": function() {
        Remote.getWithStatus("action=RESTART");
        setTimeout(function(){document.location.reload(); console.log("Delayed REFRESH");}, 60000);
    },
    "monitor-on-button": function() {
        Remote.getWithStatus("action=MONITORON");
    },
    "monitor-off-button": function() {
        Remote.getWithStatus("action=MONITOROFF");
    },
    "refresh-mm-button": function () {
        Remote.getWithStatus("action=REFRESH");
    },

    // config menu buttons
    "add-module": function() {
        window.location.hash = "add-module-menu";
    },
    "save-config": function() {
        Remote.saveConfig();
    },

    // main menu
    "save-button": function() {
        Remote.getWithStatus("action=SAVE");
    },
    "close-popup": function() {
        Remote.closePopup();
    },
    "close-result": function() {
        Remote.setStatus("none");
    },

    // update Menu
    "update-mm-button": function () {
        Remote.updateModule(undefined);
    },

    // alert menu
    "send-alert-button": function () {
        var kvpairs = [];
        var form = document.getElementById("alert");
        for ( var i = 0; i < form.elements.length; i++ ) {
            var e = form.elements[i];
            kvpairs.push(encodeURIComponent(e.name) + "=" + encodeURIComponent(e.value));
        }
        Remote.getWithStatus(kvpairs.join("&"));
    },
    "hide-alert-button": function () {
        Remote.getWithStatus("action=HIDE_ALERT");
    }
};

Remote.loadTranslations();
Remote.loadButtons(buttons);
Remote.loadOtherElements();

Remote.setStatus("none");

if (window.location.hash) {
    Remote.showMenu(window.location.hash.substring(1));
} else {
    Remote.showMenu("main-menu");
}

window.onhashchange = function() {
    if (Remote.skipHashChange) {
        Remote.skipHashChange = false;
        return;
    }
    if (window.location.hash) {
        Remote.showMenu(window.location.hash.substring(1));
    } else {
        Remote.showMenu("main-menu");
    }
};

// loading successful, remove error message
var loadError = document.getElementById("load-error");
loadError.parentNode.removeChild(loadError);
