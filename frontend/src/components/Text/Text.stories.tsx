import type {Meta, StoryObj} from '@storybook/react';

import { Text } from './Text';
import { TextVariant, TextWeight } from './utils/constants'

const meta = {
    title: 'Component/Text',
    component: Text,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        weight: {
            options: Object.values(TextWeight),
            control: { type: 'select' }
        },
        variant: {
            options: Object.values(TextVariant),
            control: { type: 'select' }
        },
        className: {
            control: { type: 'text' }
        }
    },
    args: { variant: TextVariant.BODY_2, children: 'Hello World' },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Thin: Story = {
    args: {
        weight: TextWeight.THIN
    }
};

export const Light: Story = {
    args: {
        weight: TextWeight.LIGHT
    }
};

export const Normal: Story = {
    args: {
        weight: TextWeight.NORMAL
    }
};

export const Medium: Story = {
    args: {
        weight: TextWeight.MEDIUM
    }
};

export const Semibold: Story = {
    args: {
        weight: TextWeight.SEMIBOLD
    }
};
