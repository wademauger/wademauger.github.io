import React from 'react';

// Common component prop patterns
export interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export interface LoadingProps {
  loading?: boolean;
  loadingText?: string;
}

export interface ErrorProps {
  error?: string | null;
  onErrorDismiss?: () => void;
}

// Form-related types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'number' | 'select';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
}

export interface FormProps extends BaseComponentProps {
  onSubmit: (values: Record<string, any>) => void;
  onCancel?: () => void;
  loading?: boolean;
  initialValues?: Record<string, any>;
}

// Layout component types
export interface LayoutProps extends BaseComponentProps {
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  footer?: React.ReactNode;
}

export interface ModalProps extends BaseComponentProps {
  visible: boolean;
  title?: string;
  onCancel: () => void;
  onOk?: () => void;
  okText?: string;
  cancelText?: string;
  loading?: boolean;
}

// Navigation types
export interface NavItem {
  key: string;
  label: string;
  path: string;
  icon?: React.ReactNode;
  children?: NavItem[];
}

export interface BreadcrumbItem {
  title: string;
  path?: string;
}

// Data display types
export interface TableColumn<T = any> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
}

export interface TableProps<T = any> extends BaseComponentProps {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: boolean;
  rowKey?: keyof T | ((record: T) => string);
  onRowClick?: (record: T, index: number) => void;
}

// Event handler types
export type ClickHandler = (event: React.MouseEvent) => void;
export type ChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => void;
export type SelectHandler = (value: string) => void;
export type SubmitHandler = (event: React.FormEvent) => void;