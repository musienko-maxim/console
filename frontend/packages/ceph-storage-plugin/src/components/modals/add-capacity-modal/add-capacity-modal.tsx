import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import * as classNames from 'classnames';
import { FieldLevelHelp, humanizeBinaryBytes } from '@console/internal/components/utils/index';
import {
  createModalLauncher,
  ModalBody,
  ModalSubmitFooter,
  ModalTitle,
} from '@console/internal/components/factory';
import { usePrometheusPoll } from '@console/internal/components/graphs/prometheus-poll-hook';
import { k8sPatch, StorageClassResourceKind } from '@console/internal/module/k8s';
import { getName, getRequestedPVCSize } from '@console/shared';
import { OCSServiceModel } from '../../../models';
import { getCurrentDeviceSetIndex } from '../../../utils/add-capacity';
import { OSD_CAPACITY_SIZES } from '../../../utils/osd-size-dropdown';
import {
  NO_PROVISIONER,
  OCS_DEVICE_SET_ARBITER_REPLICA,
  OCS_DEVICE_SET_REPLICA,
} from '../../../constants';
import {
  requestedCapacityTooltip,
  storageClassTooltip,
  defaultRequestSize,
} from '../../../constants/ocs-install';
import { OCSStorageClassDropdown } from '../storage-class-dropdown';
import { PVsAvailableCapacity } from '../../ocs-install/pvs-available-capacity';
import { createDeviceSet } from '../../ocs-install/ocs-request-data';
import { cephCapacityResource } from '../../../constants/resources';
import { DeviceSet } from '../../../types';
import './_add-capacity-modal.scss';
import { checkArbiterCluster, checkFlexibleScaling } from '../../../utils/common';

const getProvisionedCapacity = (value: number) => (value % 1 ? (value * 3).toFixed(2) : value * 3);

export const AddCapacityModal = (props: AddCapacityModalProps) => {
  const { t } = useTranslation();

  const { ocsConfig, close, cancel } = props;
  const deviceSets: DeviceSet[] = ocsConfig?.spec.storageDeviceSets || [];

  const [response, loadError, loading] = usePrometheusPoll(cephCapacityResource);
  const [storageClass, setStorageClass] = React.useState<StorageClassResourceKind>(null);
  /* TBD(Afreen): Show installation storage class as preselected 
                  Change state metadata
  */
  const [inProgress, setProgress] = React.useState(false);
  const [errorMessage, setError] = React.useState('');

  const cephCapacity: string = response?.data?.result?.[0]?.value[1];
  const osdSizeWithUnit = getRequestedPVCSize(deviceSets[0].dataPVCTemplate);
  const osdSizeWithoutUnit: number = OSD_CAPACITY_SIZES[osdSizeWithUnit];
  const provisionedCapacity = getProvisionedCapacity(osdSizeWithoutUnit);
  const isNoProvionerSC: boolean = storageClass?.provisioner === NO_PROVISIONER;
  const selectedSCName: string = getName(storageClass);
  const deviceSetIndex: number = getCurrentDeviceSetIndex(deviceSets, selectedSCName);
  const hasFlexibleScaling = checkFlexibleScaling(ocsConfig);
  const isArbiterEnabled: boolean = checkArbiterCluster(ocsConfig);
  const replica = isArbiterEnabled ? OCS_DEVICE_SET_ARBITER_REPLICA : OCS_DEVICE_SET_REPLICA;
  const name = getName(ocsConfig);

  let currentCapacity: React.ReactNode;

  if (loading) {
    currentCapacity = (
      <div className="skeleton-text ceph-add-capacity__current-capacity--loading" />
    );
  } else if (loadError || !cephCapacity || !osdSizeWithoutUnit || deviceSetIndex === -1) {
    currentCapacity = <div className="text-muted">{t('ceph-storage-plugin~Not available')}</div>;
  } else {
    currentCapacity = (
      <div className="text-muted">
        <strong>{`${humanizeBinaryBytes(Number(cephCapacity) / replica).string} / ${deviceSets[
          deviceSetIndex
        ].count * osdSizeWithoutUnit} TiB`}</strong>
      </div>
    );
  }

  const onChange = (sc: StorageClassResourceKind) => setStorageClass(sc);

  const submit = (event: React.FormEvent<EventTarget>) => {
    event.preventDefault();
    setProgress(true);
    const patch = {
      op: '',
      path: '',
      value: null,
    };
    const osdSize = isNoProvionerSC ? defaultRequestSize.BAREMETAL : osdSizeWithUnit;
    let portable = !isNoProvionerSC;
    let deviceSetReplica = replica;
    let deviceSetCount = 1;

    if (deviceSetIndex === -1) {
      if (hasFlexibleScaling) {
        portable = false;
        deviceSetReplica = 1;
      }
      patch.op = 'add';
      patch.path = `/spec/storageDeviceSets/-`;
      patch.value = createDeviceSet(
        selectedSCName,
        osdSize,
        portable,
        deviceSetReplica,
        deviceSetCount,
      );
    } else {
      if (hasFlexibleScaling) deviceSetCount = 3;
      patch.op = 'replace';
      patch.path = `/spec/storageDeviceSets/${deviceSetIndex}/count`;
      patch.value = deviceSets[deviceSetIndex].count + deviceSetCount;
    }

    if (!selectedSCName) {
      setError(t('ceph-storage-plugin~No StorageClass selected'));
      setProgress(false);
    } else {
      k8sPatch(OCSServiceModel, ocsConfig, [patch])
        .then(() => {
          setProgress(false);
          close();
        })
        .catch((err) => {
          setError(err);
          setProgress(false);
        });
    }
  };

  return (
    <form onSubmit={submit} className="modal-content modal-content--no-inner-scroll">
      <ModalTitle>{t('ceph-storage-plugin~Add Capacity')}</ModalTitle>
      <ModalBody>
        <Trans t={t} ns="ceph-storage-plugin" values={{ name }}>
          Adding capacity for <strong>{{ name }}</strong>, may increase your expenses.
        </Trans>
        <div className="ceph-add-capacity__modal">
          <div
            className={classNames('ceph-add-capacity__sc-dropdown', {
              'ceph-add-capacity__sc-dropdown--margin': !isNoProvionerSC,
            })}
          >
            <label className="control-label" htmlFor="storageClass">
              {t('ceph-storage-plugin~Storage Class')}
              <FieldLevelHelp>{storageClassTooltip(t)}</FieldLevelHelp>
            </label>
            <OCSStorageClassDropdown onChange={onChange} data-test="add-cap-sc-dropdown" />
          </div>
          {isNoProvionerSC ? (
            <PVsAvailableCapacity
              replica={replica}
              data-test-id="ceph-add-capacity-pvs-available-capacity"
              storageClass={storageClass}
            />
          ) : (
            <div>
              <label className="control-label" htmlFor="requestSize">
                {t('ceph-storage-plugin~Raw Capacity')}
                <FieldLevelHelp>{requestedCapacityTooltip}</FieldLevelHelp>
              </label>
              <div className="ceph-add-capacity__form">
                <input
                  className={classNames('pf-c-form-control', 'ceph-add-capacity__input')}
                  type="number"
                  name="requestSize"
                  value={osdSizeWithoutUnit}
                  required
                  disabled
                  data-test-id="requestSize"
                />
                {provisionedCapacity && (
                  <div className="ceph-add-capacity__input--info-text">
                    {t('ceph-storage-plugin~x {{ replica, number }} replicas =', { replica })}{' '}
                    <strong data-test="provisioned-capacity">{provisionedCapacity} TiB</strong>
                  </div>
                )}
              </div>
              <div className="ceph-add-capacity__current-capacity">
                <div className="text-secondary ceph-add-capacity__current-capacity--text">
                  <strong>{t('ceph-storage-plugin~Currently Used:')}</strong>
                </div>
                {currentCapacity}
              </div>
            </div>
          )}
        </div>
      </ModalBody>
      <ModalSubmitFooter
        inProgress={inProgress}
        errorMessage={errorMessage}
        submitText={t('ceph-storage-plugin~Add')}
        cancel={cancel}
      />
    </form>
  );
};

export type AddCapacityModalProps = {
  kind?: any;
  ocsConfig?: any;
  cancel?: () => void;
  close?: () => void;
};

export const addCapacityModal = createModalLauncher(AddCapacityModal);
