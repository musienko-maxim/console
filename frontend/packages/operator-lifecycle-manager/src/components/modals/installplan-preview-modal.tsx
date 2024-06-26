import * as React from 'react';
import { ActionGroup, Button } from '@patternfly/react-core';
import { safeDump } from 'js-yaml';
import { useTranslation } from 'react-i18next';
import {
  createModalLauncher,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from '@console/internal/components/factory/modal';
import { ResourceLink, CopyToClipboard } from '@console/internal/components/utils';
import { StepResource } from '../../types';
import { referenceForStepResource } from '../index';

const InstallPlanPreview: React.FC<InstallPlanPreviewModalProps> = ({ cancel, stepResource }) => {
  const { t } = useTranslation();
  return (
    <div className="modal-content">
      <ModalTitle>
        {t('olm~InstallPlan Preview')}{' '}
        <ResourceLink
          linkTo={false}
          name={stepResource.name}
          kind={referenceForStepResource(stepResource)}
        />
      </ModalTitle>
      <ModalBody>
        <CopyToClipboard value={safeDump(JSON.parse(stepResource.manifest))} />
      </ModalBody>
      <ModalFooter>
        <ActionGroup className="pf-v5-c-form pf-v5-c-form__actions--right pf-v5-c-form__group--no-top-margin">
          <Button type="button" variant="secondary" onClick={() => cancel()}>
            {t('public~OK')}
          </Button>
        </ActionGroup>
      </ModalFooter>
    </div>
  );
};

export const installPlanPreviewModal = createModalLauncher<InstallPlanPreviewModalProps>(
  InstallPlanPreview,
);

export type InstallPlanPreviewModalProps = {
  stepResource: StepResource;
  cancel?: () => void;
  close?: () => void;
};

InstallPlanPreview.displayName = 'InstallPlanPreview';
