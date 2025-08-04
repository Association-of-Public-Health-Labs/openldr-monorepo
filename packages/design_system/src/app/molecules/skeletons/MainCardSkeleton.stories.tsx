import { Meta, StoryFn } from "@storybook/react-vite";
import { MainCardSkeleton } from "./MainCardSkeleton";

const meta: Meta<typeof MainCardSkeleton> = {
  title: "DesignSystem/Molecules/Skeletons/MainCardSkeleton",
  component: MainCardSkeleton,
  tags: ["autodocs"],
  argTypes: {
  },
};

export default meta;

// Template for the DateRange component
const Template: StoryFn<any> = (args) => <MainCardSkeleton sx={{width: "850px", height: "200px"}} {...args} />;

export const Default = Template.bind({});