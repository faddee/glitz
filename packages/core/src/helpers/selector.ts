import { Style } from '../style';

// Unfortunately we need this until there's a way to have index signatures for
// other types like: https://github.com/Microsoft/TypeScript/issues/7765.
// This is a work around that works thanks to dynamic properties.

export default function selector(selectors: string | string[], style: Style): Style {
  // TODO Pseudo validation
  return typeof selectors === 'string'
    ? { [selectors]: style }
    : selectors.reduce((acc, value) => ({ ...acc, [value]: style }), {});
}
