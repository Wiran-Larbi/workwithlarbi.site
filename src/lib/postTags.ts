export const WORK_TAG = 'work';

export function postHasWorkTag(data: { tags?: string[] }): boolean {
  return Boolean(data.tags?.includes(WORK_TAG));
}
