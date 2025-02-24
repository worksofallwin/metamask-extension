import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import ConfigureSnapPopup, {
  ConfigureSnapPopupType,
} from '../../../components/app/configure-snap-popup';
import {
  BUTTON_VARIANT,
  Box,
  Button,
  Icon,
  IconName,
} from '../../../components/component-library';
import { Text } from '../../../components/component-library/text/deprecated';
import {
  AlignItems,
  BackgroundColor,
  BorderColor,
  BorderRadius,
  TextColor,
  Display,
  FlexDirection,
  IconColor,
  JustifyContent,
  TextVariant,
} from '../../../helpers/constants/design-system';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { SnapCardProps } from '../new-snap-account-page/new-snap-account-page';

export default function SnapCard({
  iconUrl,
  snapTitle,
  snapSlug,
  isInstalled,
  website,
  id,
  onClickFunc,
}: Pick<
  SnapCardProps,
  'iconUrl' | 'snapTitle' | 'snapSlug' | 'isInstalled' | 'website' | 'id'
> & { onClickFunc: () => void }) {
  const t = useI18nContext();
  const history = useHistory();
  const [showConfigPopover, setShowConfigPopover] = useState(false);

  return (
    <Box
      display={Display.Flex}
      flexDirection={FlexDirection.Column}
      backgroundColor={BackgroundColor.backgroundDefault}
      borderColor={BorderColor.borderMuted}
      borderRadius={BorderRadius.SM}
      borderWidth={1}
      padding={[4, 4, 4, 4]}
      data-testid="key-management-snap"
    >
      <Box
        display={Display.Flex}
        justifyContent={JustifyContent.spaceBetween}
        alignItems={AlignItems.center}
        marginBottom={2}
      >
        <Box
          display={Display.Flex}
          justifyContent={JustifyContent.center}
          alignItems={AlignItems.center}
          style={{
            borderRadius: '50%',
            height: '32px',
            width: '32px',
            backgroundColor: BackgroundColor.infoDefault,
          }}
          borderWidth={1}
          borderColor={BorderColor.borderMuted}
          padding={[2, 2, 2, 2]}
          marginRight={1}
        >
          {iconUrl ? (
            <img src={iconUrl} className="snap-detail-icon" />
          ) : (
            // This is the fallback icon based on the first letter of the snap name.
            <Box
              className="snap-detail-icon"
              display={Display.Flex}
              justifyContent={JustifyContent.center}
              alignItems={AlignItems.center}
            >
              <Text>{snapTitle ? snapTitle[0] : '?'}</Text>
            </Box>
          )}
        </Box>
        {isInstalled ? (
          <Button
            data-testid="configure-snap-button"
            variant={BUTTON_VARIANT.SECONDARY}
            onClick={() => setShowConfigPopover(true)}
          >
            {t('snapConfigure')}
          </Button>
        ) : (
          <Button
            data-testid="install-snap-button"
            variant={BUTTON_VARIANT.SECONDARY}
            onClick={() => {
              history.push(`/add-snap-account/${id}`);
            }}
          >
            {t('install')}
          </Button>
        )}
      </Box>
      <Text
        variant={TextVariant.bodySm}
        color={TextColor.textAlternative}
        marginBottom={2}
      >
        {snapTitle}
      </Text>
      <Text variant={TextVariant.headingMd} marginBottom="auto">
        {snapSlug}
      </Text>

      <Box display={Display.Flex} justifyContent={JustifyContent.spaceBetween}>
        <Icon
          data-testid="to-snap-detail"
          name={IconName.Arrow2Right}
          color={IconColor.iconAlternative}
          onClick={onClickFunc}
          marginLeft="auto"
        />
      </Box>
      <ConfigureSnapPopup
        isOpen={showConfigPopover}
        type={ConfigureSnapPopupType.CONFIGURE}
        onClose={() => setShowConfigPopover(false)}
        link={website}
      />
    </Box>
  );
}
