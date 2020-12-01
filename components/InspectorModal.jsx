const { Text, Flex } = require('powercord/components');
const { Modal } = require('powercord/components/modal');
const {
    React,
    getModule,
    getModuleByDisplayName,
    i18n: { Messages }
} = require('powercord/webpack');

const margins = getModule(['marginTop20'], false);
const AsyncComponent = require('powercord/components/AsyncComponent');
const { AdvancedScrollerThin } = getModule(['AdvancedScrollerThin'], false);
const FormSection = AsyncComponent.from(getModuleByDisplayName('FormSection'));

/**
 * Thanks to NurMarvin's GuildProfile Modal for this component.
 * @see https://github.com/NurMarvin/guild-profile/blob/master/components/GuildProfileModal.jsx#L73-L97
 */
class Section extends React.PureComponent {
    constructor(props) {
        super(props);

        this.classes = {
            marginBottom8: getModule(['marginBottom8'], false).marginBottom8,
        };
    }

    render() {
        const { children, title } = this.props;

        if (!children) return null;

        return (
            <FormSection
                className={margins.marginBottom8 + ' invite-inspector-section'}
                tag='h3'
                title={title}
            >
                <Text selectable={true}>{children}</Text>
            </FormSection>
        );
    }
}

class InspectorModal extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
    }

    render() {
        let inviter = '';
        if (this.props.invite.inviter) {
            inviter = <Section title={Messages.INVITER}>
                {this.props.invite.inviter.username}#{this.props.invite.inviter.discriminator} (ID: {this.props.invite.inviter.id})
            </Section>
        }

        const guildDescription = this.props.invite.guild.description || (this.props.invite.welcome_screen ? this.props.invite.welcome_screen.description || '' : '') || '';

        let description = '';
        if (guildDescription) {
            description = <Section title={Messages.GUILD_DESC}>
                {guildDescription}
            </Section>
        }

        return (
            <AdvancedScrollerThin className='invite-inspector' fade={true}>
                <Flex justify={Flex.Justify.START} wrap={Flex.Wrap.WRAP}>
                    <Modal className='powercord-text'>
                        <Modal.Header>
                            Invite Inspector
                        </Modal.Header>

                        <Modal.Content>
                            <Section title={Messages.CODE}>
                                {this.props.code}
                            </Section>

                            <Section title={Messages.GUILD}>
                                {this.props.invite.guild.name} (ID: {this.props.invite.guild.id})
                            </Section>

                            {description}

                            <Section title={Messages.MEMBER_COUNT}>
                                {this.props.invite.approximate_member_count}
                            </Section>

                            <Section title={Messages.CHANNEL}>
                                #{this.props.invite.channel.name} (ID: {this.props.invite.channel.id})
                            </Section>

                            {inviter}
                        </Modal.Content>
                    </Modal>
                </Flex>
            </AdvancedScrollerThin>
        )
    }
}

module.exports = InspectorModal;