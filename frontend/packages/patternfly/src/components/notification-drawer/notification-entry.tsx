import * as classNames from 'classnames';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  BlueArrowCircleUpIcon,
  BlueInfoCircleIcon,
  GreenCheckCircleIcon,
  RedExclamationCircleIcon,
  YellowExclamationTriangleIcon,
} from '@console/shared';
import { history, Timestamp } from '@console/internal/components/utils';

export enum NotificationTypes {
  info = 'info',
  warning = 'warning',
  critical = 'danger',
  success = 'success',
  update = 'update',
}

const NotificationIcon: React.FC<NotificationIconTypes> = ({ type }) => {
  switch (type) {
    case NotificationTypes.update:
      return <BlueArrowCircleUpIcon />;
    case NotificationTypes.success:
      return <GreenCheckCircleIcon />;
    case NotificationTypes.critical:
      return <RedExclamationCircleIcon />;
    case NotificationTypes.warning:
      return <YellowExclamationTriangleIcon />;
    case NotificationTypes.info:
    default:
      return <BlueInfoCircleIcon />;
  }
};

const NotificationAction: React.FC<NotificationActionProps> = ({ onClick, text, path }) => (
  <div className="pf-c-notification-drawer__header-action">
    <Link
      to={path}
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
    >
      {text}
    </Link>
  </div>
);

const NotificationEntry: React.FC<NotificationEntryProps> = ({
  actionText,
  actionPath,
  title,
  description,
  isRead = false,
  timestamp,
  targetPath,
  toggleNotificationDrawer,
  type,
}) => {
  const { t } = useTranslation();
  const notificationTypeString = (notificationType: NotificationTypes): string => {
    switch (notificationType) {
      case NotificationTypes.warning:
        return t('notification-drawer~Warning notification:');
      case NotificationTypes.critical:
        return t('notification-drawer~Critical notification:');
      case NotificationTypes.success:
        return t('notification-drawer~Success notification:');
      case NotificationTypes.update:
        return t('notification-drawer~Update notification:');
      default:
        return t('notification-drawer~Info notification:');
    }
  };

  return (
    <li
      className={classNames(`pf-c-notification-drawer__list-item pf-m-hoverable pf-m-${type}`, {
        'pf-m-read': isRead,
      })}
      tabIndex={0}
      onClick={
        targetPath
          ? () => {
              history.push(targetPath);
              toggleNotificationDrawer();
            }
          : null
      }
    >
      <div className="pf-c-notification-drawer__list-item-header">
        <span className="pf-c-notification-drawer__list-item-header-icon">
          <NotificationIcon type={type} />
        </span>
        <h4 className="pf-c-notification-drawer__list-item-header-title">
          <span className="pf-screen-reader">{notificationTypeString(type)}</span>
          {title}
        </h4>
        {actionText && actionPath && (
          <NotificationAction
            text={actionText}
            path={actionPath}
            onClick={toggleNotificationDrawer}
          />
        )}
      </div>
      <div className="pf-c-notification-drawer__list-item-description">{description}</div>
      <div className="pf-c-notification-drawer__list-item-timestamp">
        {timestamp && <Timestamp simple timestamp={timestamp} />}
      </div>
    </li>
  );
};

export type NotificationEntryProps = {
  actionText?: string;
  actionPath?: string;
  description: React.ReactNode;
  isRead?: boolean;
  targetPath?: string;
  timestamp?: string;
  title: string;
  toggleNotificationDrawer?: () => any;
  type: NotificationTypes;
};

type NotificationIconTypes = {
  type: NotificationTypes;
};

type NotificationActionProps = {
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
  text: string;
  path: string;
};

export default NotificationEntry;
