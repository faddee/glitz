import { Style } from '@glitz/type';
import { useContext, useRef, useEffect } from 'react';
import { GlitzContext } from '../components/context';
import useTheme from './use-theme';

export type DirtyStyle = Style | DirtyStyle[] | undefined;

export default function useGlitz(dirtyStyle: DirtyStyle) {
  const glitz = useContext(GlitzContext);

  if (!glitz) {
    throw new Error(
      "The `<GlitzProvider>` doesn't seem to be used correctly because the core instance wasn't provided",
    );
  }

  const theme = useTheme();

  const previousRef = useRef<[typeof glitz, typeof theme, typeof dirtyStyle?, Style[]?, string?]>([glitz, theme]);

  const isCached = previousRef.current[0] === glitz && previousRef.current[1] === theme;
  let isValid = isCached && previousRef.current[2] === dirtyStyle;

  previousRef.current[0] = glitz;
  previousRef.current[1] = theme;
  previousRef.current[2] = dirtyStyle;

  let finalStyles: Style[];

  if (!isValid) {
    finalStyles = flattenStyle([dirtyStyle]);

    if (previousRef.current[3]) {
      isValid = isCached && shallowEquals(previousRef.current[3], finalStyles);
    }

    previousRef.current[3] = finalStyles;
  }

  if (process.env.NODE_ENV !== 'production') {
    const hasWarnedCacheInvalidationsRef = useRef(false);
    const totalCacheInvalidationsRef = useRef(0);

    useEffect(() => {
      if (!isValid && typeof requestAnimationFrame === 'function' && !hasWarnedCacheInvalidationsRef.current) {
        totalCacheInvalidationsRef.current++;
        const currentCacheInvalidations = totalCacheInvalidationsRef.current;

        // Jump two frames to reset counter if there hasn't been any more renders with cache invalidation
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (totalCacheInvalidationsRef.current === currentCacheInvalidations) {
              if (currentCacheInvalidations > 5) {
                console.warn(
                  "Multiple re-renders of a styled component with invalidated cache was detected. Either make sure it doesn't re-render or make sure the cache is intact. More info: https://git.io/fxYyd",
                );

                hasWarnedCacheInvalidationsRef.current = true;
              }

              totalCacheInvalidationsRef.current = 0;
            }
          });
        });
      }
    });
  }

  if (isValid) {
    return previousRef.current[4];
  }

  if (finalStyles!.length === 0) {
    return void 0;
  }

  return (previousRef.current[4] = glitz.injectStyle(finalStyles!, theme)) || void 0;
}

export function flattenStyle(dirtyStyles: DirtyStyle[]): Style[] {
  const styles: Style[] = [];

  for (const style of dirtyStyles) {
    if (style) {
      if (Array.isArray(style)) {
        styles.push(...flattenStyle(style));
      } else {
        styles.push(style);
      }
    }
  }

  return styles;
}

function shallowEquals(a: Style[], b: Style[]) {
  if (a.length !== b.length) {
    return false;
  }

  for (const i in a) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
}
