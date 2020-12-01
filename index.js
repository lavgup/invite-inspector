const i18n = require('./i18n');
const { open } = require('powercord/modal');
const { Plugin } = require('powercord/entities');
const { inject, uninject } = require('powercord/injector');
const InspectorModal = require('./components/InspectorModal');
const {
    React,
    getModule,
    i18n: { Messages }
} = require('powercord/webpack');

const INVITE_REGEX = /discord((?:app)?\.com\/invite|\.gg)\/[a-zA-Z0-9].{2,32}/;

class InviteInspector extends Plugin {
    startPlugin() {
        powercord.api.i18n.loadAllStrings(i18n);
        return this.injectContextMenu();
    }

    isInvite(url) {
        return INVITE_REGEX.test(url);
    }

    async injectContextMenu() {
        const { MenuItem } = await getModule(['MenuItem']);

        const MessageContextMenu = await getModule(
            m => m.default && m.default.displayName === 'MessageContextMenu'
        );
        const Default = MessageContextMenu.default;

        inject('invite-inspector', MessageContextMenu, 'default', ([{ message }], res) => {
            if (!message || !message.codedLinks || !message.codedLinks.length) return res;

            let code;

            message.codedLinks.forEach(elem => {
                if (code) return;
                if (elem.type !== 'INVITE') return;

                code = elem.code;
            });

            if (code) {
                res.props.children.push(
                    React.createElement(MenuItem, {
                        name: Messages.INVITE_INSPECT,
                        separate: true,
                        id: 'inspect-invite',
                        label: Messages.INVITE_INSPECT,
                        action: async () => {
                            const { resolveInvite } = await getModule(['resolveInvite']);
                            const data = await resolveInvite(code);

                            if (!data.invite) {
                                return powercord.api.notices.sendToast('InvalidInvite', {
                                    header: Messages.II_INVALID_INVITE,
                                    content: Messages.II_INVALID_INVITE_DESC,
                                    type: 'info',
                                    timeout: 10e3,
                                    buttons: [{
                                        text: Messages.GOT_IT,
                                        color: 'red',
                                        size: 'medium',
                                        look: 'outlined',
                                    }]
                                });
                            }

                            return open(() => React.createElement(InspectorModal, data));
                        },
                    })
                );
            }

            return res;
        });

        Object.assign(MessageContextMenu.default, Default);
    }

    pluginWillUnload() {
        uninject('invite-inspector');
    }
}

module.exports = InviteInspector;