var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { customElement, bindable, computedFrom, DOM, processContent, ElementEvents, inject, PLATFORM, ObserverLocator, TaskQueue, } from 'aurelia-framework';
import { getLogger } from 'aurelia-logging';
import { StyleEngine } from '@aurelia-ux/core';
import { UxSelectTheme } from './ux-select-theme';
import { getAuViewModel, bool } from './util';
var theme = new UxSelectTheme();
var UP = 38;
// const RIGHT = 39;
var DOWN = 40;
// const LEFT = 37;
// const ESC = 27;
var ENTER = 13;
var SPACE = 32;
var logger = getLogger('ux-select');
var invalidMultipleValueMsg = 'Only null or Array instances can be bound to a multi-select';
var selectArrayContext = 'context:ux-select';
var UxSelect = /** @class */ (function () {
    function UxSelect(element, styleEngine, observerLocator, taskQueue) {
        this.element = element;
        this.styleEngine = styleEngine;
        this.observerLocator = observerLocator;
        this.taskQueue = taskQueue;
        this.selectedOption = null;
        this.ignoreSelectEvent = true;
        // Only chrome persist the element prototype when cloning with clone node
        Object.setPrototypeOf(element, UxSelectElementProto);
        this.theme = theme;
        styleEngine.ensureDefaultTheme(theme);
    }
    UxSelect.prototype.bind = function () {
        if (bool(this.autofocus)) {
            // setTimeout(focusEl, 0, this.button);
        }
        if (this.isMultiple) {
            if (!this.value) {
                this.value = [];
            }
            else if (!Array.isArray(this.value)) {
                throw new Error(invalidMultipleValueMsg);
            }
        }
        if (!this.winEvents) {
            this.winEvents = new ElementEvents(window);
        }
        // Initially Synchronize options with value of this element
        this.taskQueue.queueMicroTask(this);
    };
    UxSelect.prototype.unbind = function () {
        this.winEvents.disposeAll();
        if (this.arrayObserver) {
            this.arrayObserver.unsubscribe(selectArrayContext, this);
            this.arrayObserver = null;
        }
        this.selectedOption = null;
    };
    UxSelect.prototype.resolveDisplayValue = function () {
        var value = this.value;
        this.displayValue = Array.isArray(value) ? value.slice().sort().join(', ') : value;
    };
    UxSelect.prototype.synchronizeOptions = function () {
        var value = this.value;
        var isArray = Array.isArray(value);
        var options = this.options;
        var matcher = this.element.matcher || defaultMatcher;
        var i = options.length;
        this.ignoreSelectEvent = true;
        var _loop_1 = function () {
            var option = options[i];
            var optionValue = option.value;
            if (isArray) {
                option.selected = value.findIndex(function (item) { return !!matcher(optionValue, item); }) !== -1;
                return "continue";
            }
            option.selected = !!matcher(optionValue, value);
        };
        while (i--) {
            _loop_1();
        }
        this.ignoreSelectEvent = false;
    };
    UxSelect.prototype.synchronizeValue = function () {
        var options = this.options;
        var ii = options.length;
        var count = 0;
        var optionValues = [];
        // extract value from ux-option
        for (var i = 0; i < ii; i++) {
            var option = options[i];
            if (!option.selected) {
                continue;
            }
            optionValues.push(option.value);
            count++;
        }
        if (this.isMultiple) {
            // multi-select
            if (Array.isArray(this.value)) {
                var selectValues = this.value;
                var matcher_1 = this.element.matcher || defaultMatcher;
                // remove items that are no longer selected.
                var i = 0;
                var _loop_2 = function () {
                    var a = selectValues[i];
                    if (optionValues.findIndex(function (b) { return matcher_1(a, b); }) === -1) {
                        selectValues.splice(i, 1);
                    }
                    else {
                        i++;
                    }
                };
                while (i < selectValues.length) {
                    _loop_2();
                }
                // add items that have been selected.
                i = 0;
                var _loop_3 = function () {
                    var a = optionValues[i];
                    if (selectValues.findIndex(function (b) { return matcher_1(a, b); }) === -1) {
                        selectValues.push(a);
                    }
                    i++;
                };
                while (i < optionValues.length) {
                    _loop_3();
                }
                this.resolveDisplayValue();
                return; // don't notify.
            }
        }
        else {
            // single-select
            // tslint:disable-next-line:prefer-conditional-expression
            if (count === 0) {
                optionValues = null;
            }
            else {
                optionValues = optionValues[0];
            }
            this.setValue(optionValues);
        }
    };
    UxSelect.prototype.setupListAnchor = function () {
        var _this = this;
        this.calcAnchorPosition();
        this.winEvents.subscribe('wheel', function (e) {
            if (_this.expanded) {
                if (e.target === PLATFORM.global || !_this.optionWrapperEl.contains(e.target)) {
                    _this.collapse();
                }
            }
        }, true);
    };
    UxSelect.prototype.unsetupListAnchor = function () {
        this.listAnchor = null;
        this.winEvents.disposeAll();
    };
    UxSelect.prototype.calcAnchorPosition = function () {
        var elDim = this.container.getBoundingClientRect();
        var offsetY = (48 - elDim.height) / 2;
        this.listAnchor = { x: elDim.left, y: elDim.top - offsetY };
    };
    UxSelect.prototype.onKeyboardSelect = function () {
        if (!this.expanded) {
            return;
        }
        var focusedOption = this.focusedUxOption;
        if (this.isMultiple) {
            if (!focusedOption) {
                return;
            }
            focusedOption.selected = !focusedOption.selected;
        }
        else {
            this.collapse();
        }
    };
    UxSelect.prototype.call = function () {
        this.synchronizeOptions();
    };
    UxSelect.prototype.getValue = function () {
        return this.value;
    };
    UxSelect.prototype.setValue = function (newValue) {
        if (newValue !== null && newValue !== undefined && this.isMultiple && !Array.isArray(newValue)) {
            throw new Error('Only null, undenfined or Array instances can be bound to a multi-select.');
        }
        if (this.value === newValue) {
            return;
        }
        // unsubscribe from old array.
        if (this.arrayObserver) {
            this.arrayObserver.unsubscribe(selectArrayContext, this);
            this.arrayObserver = null;
        }
        if (this.isMultiple) {
            // subscribe to new array.
            if (Array.isArray(newValue)) {
                this.arrayObserver = this.observerLocator.getArrayObserver(newValue);
                this.arrayObserver.subscribe(selectArrayContext, this);
            }
        }
        if (newValue !== this.value) {
            this.value = newValue;
            this.resolveDisplayValue();
            this.element.dispatchEvent(DOM.createCustomEvent('change', { bubbles: true }));
        }
    };
    UxSelect.prototype.expand = function () {
        var _this = this;
        if (this.expanded) {
            return;
        }
        if (this.isExpanding) {
            return;
        }
        this.isExpanding = true;
        this.optionWrapperEl.classList.add('open');
        setTimeout(function () {
            _this.optionCtEl.classList.add('open');
            _this.isExpanding = false;
            _this.expanded = true;
            _this.setFocusedOption(_this.selectedOption);
        }, this.theme.listTransition);
        this.setupListAnchor();
    };
    UxSelect.prototype.collapse = function () {
        var _this = this;
        if (this.isCollapsing) {
            return;
        }
        this.isCollapsing = true;
        this.optionCtEl.classList.remove('open');
        setTimeout(function () {
            _this.optionWrapperEl.classList.remove('open');
            _this.isCollapsing = false;
            _this.expanded = false;
            _this.setFocusedOption(null);
            _this.unsetupListAnchor();
        }, this.theme.listTransition);
    };
    UxSelect.prototype.setFocusedOption = function (focusedOption) {
        var oldFocusedOption = this.focusedUxOption;
        if (focusedOption !== oldFocusedOption) {
            if (oldFocusedOption) {
                oldFocusedOption.focused = false;
            }
            if (focusedOption) {
                focusedOption.focused = true;
                focusedOption.wave();
                focusedOption.scrollIntoView({ block: 'nearest', inline: 'nearest' });
            }
            this.focusedUxOption = focusedOption;
        }
    };
    UxSelect.prototype.moveSelectedIndex = function (offset) {
        var currentIndex = 0;
        var options = this.options;
        if (this.focusedUxOption) {
            currentIndex = options.indexOf(this.focusedUxOption);
        }
        else if (this.selectedOption) {
            currentIndex = options.indexOf(this.selectedOption);
        }
        var nextIndex = currentIndex + offset;
        if (nextIndex > options.length - 1) {
            nextIndex = options.length - 1;
        }
        if (nextIndex < 0) {
            nextIndex = 0;
        }
        var focusedOption = options[nextIndex];
        if (focusedOption.disabled) {
            if (offset > 0) {
                if (nextIndex === options.length - 1) {
                    return;
                }
                this.moveSelectedIndex(offset + 1);
            }
            else {
                if (nextIndex < 0) {
                    return;
                }
                this.moveSelectedIndex(offset - 1);
            }
            return;
        }
        this.setFocusedOption(focusedOption);
        focusedOption.focused = true;
        if (this.isMultiple) {
            // empty
        }
        else {
            this.ignoreSelectEvent = true;
            if (this.selectedOption) {
                this.selectedOption.selected = false;
            }
            this.selectedOption = focusedOption;
            this.selectedOption.selected = true;
            this.ignoreSelectEvent = false;
            this.setValue(this.selectedOption.value);
        }
    };
    UxSelect.prototype.onTriggerClick = function () {
        if (!this.isDisabled) {
            if (this.expanded) {
                return;
            }
            this.expand();
        }
    };
    UxSelect.prototype.onBlur = function () {
        if (!this.element.contains(DOM.activeElement)) {
            this.collapse();
        }
    };
    UxSelect.prototype.onSelect = function (e) {
        e.stopPropagation();
        if (this.ignoreSelectEvent) {
            return;
        }
        var newSelection = e.detail;
        var lastSelection = this.selectedOption;
        if (this.isMultiple) {
            this.synchronizeValue();
        }
        else {
            this.ignoreSelectEvent = true;
            if (lastSelection) {
                lastSelection.selected = false;
            }
            this.ignoreSelectEvent = false;
            this.selectedOption = newSelection;
            this.setValue(newSelection.value);
            if (this.expanded) {
                this.collapse();
            }
        }
    };
    UxSelect.prototype.onKeyDown = function (key) {
        if (this.isDisabled) {
            return;
        }
        // tslint:disable-next-line:switch-default
        switch (key) {
            case UP:
            case DOWN:
                this.moveSelectedIndex(key === UP ? -1 : 1);
                break;
            case ENTER:
            case SPACE:
                this.onKeyboardSelect();
                break;
        }
        return true;
    };
    UxSelect.prototype.themeChanged = function (newValue) {
        if (newValue && !newValue.themeKey) {
            newValue.themeKey = 'ux-select';
        }
        this.styleEngine.applyTheme(newValue, this.element);
    };
    UxSelect.prototype.multipleChanged = function (newValue, oldValue) {
        newValue = bool(newValue);
        oldValue = bool(oldValue);
        var hasChanged = newValue !== oldValue;
        if (hasChanged) {
            this.ignoreSelectEvent = true;
            for (var _i = 0, _a = this.options; _i < _a.length; _i++) {
                var opt = _a[_i];
                opt.selected = false;
            }
            this.ignoreSelectEvent = false;
            this.selectedOption = null;
            this.setValue(newValue
                ? [] // Changing from single to multiple = reset value to empty array
                : null // Changing from multiple to single = reset value to null
            );
        }
    };
    Object.defineProperty(UxSelect.prototype, "options", {
        get: function () {
            if (!this.optionCtEl) {
                return [];
            }
            var result = [];
            var children = this.optionCtEl.children;
            var ii = children.length;
            for (var i = 0; ii > i; ++i) {
                var element = children[i];
                if (element.nodeName === 'UX-OPTION') {
                    result.push(element);
                }
                else if (element.nodeName === 'UX-OPTGROUP') {
                    var groupOptions = element.options;
                    var jj = groupOptions.length;
                    for (var j = 0; jj > j; ++j) {
                        result.push(groupOptions[j]);
                    }
                }
            }
            return result;
        },
        enumerable: true,
        configurable: true
    });
    UxSelect.prototype.getOptions = function () {
        return this.options;
    };
    Object.defineProperty(UxSelect.prototype, "isMultiple", {
        get: function () {
            return bool(this.multiple);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UxSelect.prototype, "isDisabled", {
        get: function () {
            return bool(this.disabled);
        },
        enumerable: true,
        configurable: true
    });
    __decorate([
        bindable()
    ], UxSelect.prototype, "theme", void 0);
    __decorate([
        bindable()
    ], UxSelect.prototype, "autofocus", void 0);
    __decorate([
        bindable({ defaultValue: false })
    ], UxSelect.prototype, "disabled", void 0);
    __decorate([
        bindable({ defaultValue: false })
    ], UxSelect.prototype, "multiple", void 0);
    __decorate([
        bindable()
    ], UxSelect.prototype, "placeholder", void 0);
    __decorate([
        computedFrom('multiple')
    ], UxSelect.prototype, "isMultiple", null);
    __decorate([
        computedFrom('disabled')
    ], UxSelect.prototype, "isDisabled", null);
    UxSelect = __decorate([
        inject(Element, StyleEngine, ObserverLocator, TaskQueue),
        processContent(extractUxOption),
        customElement('ux-select')
        // @inlineView(UX_SELECT_VIEW)
    ], UxSelect);
    return UxSelect;
}());
export { UxSelect };
function extractUxOption(_, __, node) {
    if (node.hasAttribute('containerless')) {
        logger.warn('cannot use containerless on <ux-select/>. Consider using as-element instead.');
        node.removeAttribute('containerless');
    }
    var currentChild = node.firstChild;
    while (currentChild) {
        var nextSibling = currentChild.nextSibling;
        if (currentChild.nodeName === 'UX-OPTION' || currentChild.nodeName === 'UX-OPTGROUP') {
            currentChild = nextSibling;
            continue;
        }
        node.removeChild(currentChild);
        currentChild = nextSibling;
    }
    return true;
}
var UxSelectElementProto = Object.create(HTMLElement.prototype, {
    value: {
        get: function () {
            return getAuViewModel(this).getValue();
        },
        set: function (v) {
            return getAuViewModel(this).setValue(v);
        }
    },
    options: {
        get: function () {
            return getAuViewModel(this).getOptions();
        }
    }
});
function defaultMatcher(a, b) {
    return a === b;
}
