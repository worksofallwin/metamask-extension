import React, { forwardRef, Ref } from 'react';
import classnames from 'classnames';

import {
  BackgroundColor,
  BorderColor,
  TextColor,
  Display,
  JustifyContent,
  AlignItems,
  BorderRadius,
  TextVariant,
  TextTransform,
} from '../../../helpers/constants/design-system';

import { Text } from '../text/deprecated';

import { AvatarBaseProps, AvatarBaseSize } from './avatar-base.types';

export const AvatarBase = forwardRef(
  (
    {
      size = AvatarBaseSize.Md,
      children,
      backgroundColor = BackgroundColor.backgroundAlternative,
      borderColor = BorderColor.borderDefault,
      color = TextColor.textDefault,
      className = '',
      ...props
    }: AvatarBaseProps,
    ref: Ref<HTMLElement>,
  ) => {
    let fallbackTextVariant;

    if (size === AvatarBaseSize.Lg || size === AvatarBaseSize.Xl) {
      fallbackTextVariant = TextVariant.bodyLgMedium;
    } else if (size === AvatarBaseSize.Sm || size === AvatarBaseSize.Md) {
      fallbackTextVariant = TextVariant.bodySm;
    } else {
      fallbackTextVariant = TextVariant.bodyXs;
    }
    return (
      <Text
        className={classnames(
          'mm-avatar-base',
          `mm-avatar-base--size-${size}`,
          className,
        )}
        ref={ref}
        as="div"
        display={Display.Flex}
        justifyContent={JustifyContent.center}
        alignItems={AlignItems.center}
        borderRadius={BorderRadius.full}
        variant={fallbackTextVariant}
        textTransform={TextTransform.Uppercase}
        {...{ backgroundColor, borderColor, color, ...props }}
      >
        {children}
      </Text>
    );
  },
);
