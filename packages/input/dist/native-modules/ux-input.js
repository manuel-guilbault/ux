var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { customElement, bindable } from 'aurelia-templating';
import { DOM } from 'aurelia-pal';
import { observable } from 'aurelia-binding';
import { inject } from 'aurelia-dependency-injection';
import { StyleEngine } from '@aurelia-ux/core';
import { UxInputTheme } from './ux-input-theme';
var theme = new UxInputTheme();
var UxInput = /** @class */ (function () {
    function UxInput(element, styleEngine) {
        this.element = element;
        this.styleEngine = styleEngine;
        this.autofocus = null;
        this.disabled = false;
        this.readonly = false;
        this.rawValue = '';
        this.focused = false;
        this.value = undefined;
        Object.setPrototypeOf(element, uxInputElementProto);
        styleEngine.ensureDefaultTheme(theme);
    }
    UxInput.prototype.bind = function () {
        var element = this.element;
        var textbox = this.textbox;
        if (this.autofocus || this.autofocus === '') {
            this.focused = true;
        }
        if (element.hasAttribute('placeholder')) {
            var attributeValue = element.getAttribute('placeholder');
            if (attributeValue) {
                textbox.setAttribute('placeholder', attributeValue);
                element.removeAttribute('placeholder');
            }
        }
        if (element.hasAttribute('step')) {
            var attributeValue = element.getAttribute('step');
            if (attributeValue) {
                textbox.setAttribute('step', attributeValue);
                element.removeAttribute('step');
            }
        }
        if ([
            'text',
            'password',
            'number',
            'email',
            'url',
            'tel',
            'search'
        ].includes(this.type)) {
            textbox.setAttribute('type', this.type);
        }
        if (this.min) {
            textbox.setAttribute('min', this.min.toString());
        }
        if (this.max) {
            textbox.setAttribute('max', this.max.toString());
        }
        if (this.minlength) {
            textbox.setAttribute('minlength', this.minlength.toString());
        }
        if (this.maxlength) {
            textbox.setAttribute('maxlength', this.maxlength.toString());
        }
        this.themeChanged(this.theme);
    };
    UxInput.prototype.attached = function () {
        this.textbox.addEventListener('change', stopEvent);
        this.textbox.addEventListener('input', stopEvent);
    };
    UxInput.prototype.detached = function () {
        this.textbox.removeEventListener('change', stopEvent);
        this.textbox.removeEventListener('input', stopEvent);
    };
    UxInput.prototype.getValue = function () {
        return this.value;
    };
    UxInput.prototype.setValue = function (value) {
        var oldValue = this.value;
        var newValue = this.processRawValue(value);
        if (oldValue !== newValue) {
            this.value = newValue;
            this.ignoreRawChanges = true;
            this.rawValue = newValue === null || newValue === undefined ? '' : newValue.toString();
            this.ignoreRawChanges = false;
            this.element.dispatchEvent(DOM.createCustomEvent('change', { bubbles: true }));
        }
    };
    UxInput.prototype.processRawValue = function (rawValue) {
        var newValue = rawValue;
        if (this.type === 'number') {
            newValue = rawValue === '' ? NaN : Number(rawValue);
            if (isNaN(newValue)) {
                newValue = null;
            }
            else {
                if (this.min !== undefined && this.min > newValue) {
                    newValue = this.min;
                }
                if (this.max !== undefined && newValue > this.max) {
                    newValue = this.max;
                }
            }
        }
        return newValue;
    };
    UxInput.prototype.themeChanged = function (newValue) {
        if (newValue != null && newValue.themeKey == null) {
            newValue.themeKey = 'input';
        }
        this.styleEngine.applyTheme(newValue, this.element);
    };
    UxInput.prototype.focusedChanged = function (focused) {
        this.element.dispatchEvent(DOM.createCustomEvent(focused ? 'focus' : 'blur', { bubbles: false }));
    };
    UxInput.prototype.typeChanged = function (newValue) {
        if (newValue !== 'text' && newValue !== 'password' && newValue !== 'number') {
            this.type = 'text';
        }
    };
    UxInput.prototype.rawValueChanged = function (newValue) {
        if (this.ignoreRawChanges) {
            return;
        }
        this.setValue(newValue);
    };
    __decorate([
        bindable
    ], UxInput.prototype, "autofocus", void 0);
    __decorate([
        bindable
    ], UxInput.prototype, "disabled", void 0);
    __decorate([
        bindable
    ], UxInput.prototype, "maxlength", void 0);
    __decorate([
        bindable
    ], UxInput.prototype, "minlength", void 0);
    __decorate([
        bindable
    ], UxInput.prototype, "min", void 0);
    __decorate([
        bindable
    ], UxInput.prototype, "max", void 0);
    __decorate([
        bindable
    ], UxInput.prototype, "readonly", void 0);
    __decorate([
        bindable
    ], UxInput.prototype, "theme", void 0);
    __decorate([
        bindable
    ], UxInput.prototype, "type", void 0);
    __decorate([
        observable
    ], UxInput.prototype, "rawValue", void 0);
    __decorate([
        observable
    ], UxInput.prototype, "focused", void 0);
    UxInput = __decorate([
        inject(Element, StyleEngine),
        customElement('ux-input')
    ], UxInput);
    return UxInput;
}());
export { UxInput };
function stopEvent(e) {
    e.stopPropagation();
}
var getVm = function (_) { return _.au.controller.viewModel; };
var uxInputElementProto = Object.create(HTMLElement.prototype, {
    value: {
        get: function () {
            return getVm(this).getValue();
        },
        set: function (value) {
            getVm(this).setValue(value);
        }
    }
});
