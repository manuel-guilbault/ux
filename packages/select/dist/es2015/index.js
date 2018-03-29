import { PLATFORM, bindingMode, } from 'aurelia-framework';
import * as AuBinding from 'aurelia-binding';
import { AureliaUX } from '@aurelia-ux/core';
export { UxOption } from './ux-option';
export { UxOptGroup } from './ux-optgroup';
export { UxSelect } from './ux-select';
export { UxSelectTheme } from './ux-select-theme';
export function configure(config) {
    config.container.get(AureliaUX).registerUxElementConfig(uxSelectConfig);
    config.globalResources([
        PLATFORM.moduleName('./ux-select'),
        PLATFORM.moduleName('./ux-optgroup'),
        PLATFORM.moduleName('./ux-option')
    ]);
}
const uxSelectConfig = {
    tagName: 'ux-select',
    properties: {
        value: {
            defaultBindingMode: bindingMode.twoWay,
            getObserver(element, _) {
                return new AuBinding.ValueAttributeObserver(element, 'value', uxSelectChangeHandler);
            }
        }
    }
};
const uxSelectChangeHandler = {
    subscribe(target, callbackOrListener) {
        target.addEventListener('change', callbackOrListener, false);
        return function () {
            target.removeEventListener('change', callbackOrListener, false);
        };
    }
};
