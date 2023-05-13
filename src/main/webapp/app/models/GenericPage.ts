import { Page } from 'api-client';

export interface GenericPage<T> extends Omit<Page, 'content'> {
  content: T[];
}
