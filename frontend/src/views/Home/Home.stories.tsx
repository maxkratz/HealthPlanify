import type {Meta, StoryObj} from '@storybook/react';

import { Home } from './Home';

const meta = {
    title: 'Component/Home',
    component: Home,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
    },
    args: { },
} satisfies Meta<typeof Home>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Miau: Story = {
    args: {
    }
};