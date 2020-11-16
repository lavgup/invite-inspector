const { open } = require('powercord/modal');
const { Plugin } = require('powercord/entities');
const { React, getModule } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');
const InspectorModal = require('./components/InspectorModal');

const INVITE_REGEX = /discord((?:app)?\.com\/invite|\.gg)\/[a-zA-Z0-9].{2,32}/;

class InviteInspector extends Plugin {
    startPlugin() {
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

        inject('invite-inspector', MessageContextMenu, 'default', ([{message}], res) => {
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
                        name: 'Inspect Invite',
                        separate: true,
                        id: "inspect-invite",
                        label: 'Inspect Invite',
                        action: async () => {
                            const { resolveInvite } = await getModule(['resolveInvite']);
                            const data = await resolveInvite(code);

                            if (!data.invite) {
                                return powercord.api.notices.sendToast('InvalidInvite', {
                                    header: 'Invalid invite',
                                    content: "That wasn't a valid invite!",
                                    type: 'info',
                                    timeout: 10e3,
                                    buttons: [{
                                        text: 'Got It',
                                        color: 'red',
                                        size: 'medium',
                                        look: 'outlined',
                                    }],
                                });
                            }

                            return open(() => React.createElement(InspectorModal, data))
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