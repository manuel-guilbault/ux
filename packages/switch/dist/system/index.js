System.register(["aurelia-framework", "aurelia-binding", "@aurelia-ux/core", "./ux-switch-theme", "./ux-switch"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function configure(config) {
        config.container.get(core_1.AureliaUX).registerUxElementConfig(uxSwitchConfig);
        config.globalResources([
            aurelia_framework_1.PLATFORM.moduleName('@aurelia-ux/switch/ux-switch')
        ]);
    }
    exports_1("configure", configure);
    var aurelia_framework_1, AuBinding, core_1, uxSwitchConfig, uxSwitchChangeHandler;
    return {
        setters: [
            function (aurelia_framework_1_1) {
                aurelia_framework_1 = aurelia_framework_1_1;
            },
            function (AuBinding_1) {
                AuBinding = AuBinding_1;
            },
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (ux_switch_theme_1_1) {
                exports_1({
                    "UxSwitchTheme": ux_switch_theme_1_1["UxSwitchTheme"]
                });
            },
            function (ux_switch_1_1) {
                exports_1({
                    "UxSwitch": ux_switch_1_1["UxSwitch"]
                });
            }
        ],
        execute: function () {
            uxSwitchConfig = {
                tagName: 'ux-switch',
                properties: {
                    checked: {
                        defaultBindingMode: aurelia_framework_1.bindingMode.twoWay,
                        getObserver: function (element, _, observerLocator) {
                            return new AuBinding.CheckedObserver(element, uxSwitchChangeHandler, observerLocator);
                        }
                    }
                }
            };
            uxSwitchChangeHandler = {
                subscribe: function (target, callbackOrListener) {
                    target.addEventListener('change', callbackOrListener, false);
                    return function () {
                        target.removeEventListener('change', callbackOrListener, false);
                    };
                }
            };
        }
    };
});
