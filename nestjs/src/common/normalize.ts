import { HttpException, HttpStatus } from '@nestjs/common';
import { Messages } from './messages';
import {
  DEFAULT_INDEX_FRAGMENT_PREFIX,
  DEFAULT_REFERENCE_PREFIX,
  DEFAULT_CONFIG,
} from './constants';
import { cosmiconfig } from 'cosmiconfig';
import { _ } from 'lodash';

export function normalizeSkipLimit(skip, limit) {
  skip = parseInt(`${skip}`, 10);
  limit = parseInt(`${limit}`, 10);
  if (isNaN(skip) || isNaN(limit) || skip < 0 || limit < 0) {
    throw new HttpException(
      Messages.SKIP_QUERY_NO_POSITIVE_NUMBER,
      HttpStatus.PRECONDITION_FAILED,
    );
  }
  return { skip, limit };
}

export function normalizeFragment(frag: string) {
  return (frag || '').startsWith(DEFAULT_INDEX_FRAGMENT_PREFIX)
    ? frag
    : `${DEFAULT_INDEX_FRAGMENT_PREFIX}${frag}`;
}

export function normalizeReference(frag: string) {
  return frag.startsWith(DEFAULT_REFERENCE_PREFIX)
    ? frag
    : `${DEFAULT_REFERENCE_PREFIX}${frag}`;
}

export async function normalizeConfig(config) {
  const configExplorer = cosmiconfig('norest');
  const noRestFileConfig = await configExplorer.search();
  return _.merge(
    DEFAULT_CONFIG,
    noRestFileConfig ? noRestFileConfig.config : {},
    config,
  );
}
