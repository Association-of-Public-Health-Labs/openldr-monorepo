import { Meta, StoryFn } from "@storybook/react";
import { UserNavigation, UserProps } from "./UserNavigation";

const meta: Meta<typeof UserNavigation> = {
  title: "DesignSystem/Molecules/Headers/UserNavigation",
  component: UserNavigation,
  tags: ["autodocs"],
  argTypes: {
    user: {
      description: "The user object containing name, email, and avatar.",
      control: { type: "object" },
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
The **Avatar** component displays a user's profile picture, name, and email with a dropdown menu for additional actions like viewing the profile, accessing settings, or logging out.
        `,
      },
    },
  },
};

export default meta;

// Template for the component
const Template: StoryFn<UserProps> = (args) => <UserNavigation {...args} />;

// Default story
export const Default = Template.bind({});
Default.args = {
  user: {
    name: "John Doe",
    email: "john.doe@aphl.org",
    avatar: "https://i.pravatar.cc/150?img=3",
  },
};

// No Avatar Image story
export const NoAvatar = Template.bind({});
NoAvatar.args = {
  user: {
    name: "Jane Smith",
    email: "jane.smith@aphl.org",
    avatar: undefined,
  },
};

// Custom Name and Email story
export const CustomUser = Template.bind({});
CustomUser.args = {
  user: {
    name: "Michael Scott",
    email: "michael.scott@aphl.org",
    avatar: "https://i.pravatar.cc/150?img=4",
  },
};

// Long Name story
export const LongName = Template.bind({});
LongName.args = {
  user: {
    name: "Alexandria Ocasio-Cortez",
    email: "aoc@aphl.org",
    avatar: "https://i.pravatar.cc/150?img=5",
  },
};

// No Email story
export const NoEmail = Template.bind({});
NoEmail.args = {
  user: {
    name: "Mystery User",
    email: "",
    avatar: "https://i.pravatar.cc/150?img=6",
  },
};
