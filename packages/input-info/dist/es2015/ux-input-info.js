var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { customElement, bindable } from 'aurelia-templating';
import { inject } from 'aurelia-dependency-injection';
import { UxInputInfoTheme } from './ux-input-info-theme';
import { StyleEngine } from '@aurelia-ux/core';
const theme = new UxInputInfoTheme();
let UxInputInfo = class UxInputInfo {
    constructor(element, styleEngine) {
        this.element = element;
        this.styleEngine = styleEngine;
        this.uxInputCounter = null;
        styleEngine.ensureDefaultTheme(theme);
    }
    bind() {
        if (this.target === undefined) {
            this.findAndSetTarget(this.element);
        }
        this.themeChanged(this.theme);
    }
    themeChanged(newValue) {
        if (newValue != null && newValue.themeKey == null) {
            newValue.themeKey = 'input-info';
        }
        this.styleEngine.applyTheme(newValue, this.element);
    }
    findAndSetTarget(element) {
        const inputElement = element.previousElementSibling;
        if (!inputElement) {
            return;
        }
        if (inputElement.nodeName === 'UX-INPUT' || inputElement.nodeName === 'UX-TEXTAREA') {
            this.target = inputElement.au.controller.viewModel;
        }
    }
};
__decorate([
    bindable
], UxInputInfo.prototype, "target", void 0);
__decorate([
    bindable
], UxInputInfo.prototype, "uxInputCounter", void 0);
__decorate([
    bindable
], UxInputInfo.prototype, "theme", void 0);
UxInputInfo = __decorate([
    inject(Element, StyleEngine),
    customElement('ux-input-info')
], UxInputInfo);
export { UxInputInfo };
