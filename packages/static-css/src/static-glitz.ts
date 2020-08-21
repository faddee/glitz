export type StaticStyleObject = {
  elementName?: string;
  styles: { [rule: string]: any }[];
};

const styledFunction = (...args: any[]) => {
  const ret = (...innerArgs: any[]) => {
    return styled(...[...args, ...innerArgs]);
  };
  const expandedArgs = args.map(expandStyledFunction);

  return Object.assign(ret, {
    styles: expandedArgs
      .filter(a => typeof a === 'object' || 'styles' in a)
      .reduce((acc, a) => acc.concat('styles' in a ? a.styles : a), []),
    elementName: getString(expandedArgs.find(a => typeof a === 'string' || 'elementName' in a)),
    all: expandedArgs,
  });
};

export const styled = Object.assign(styledFunction, {
  div: (args: any) => styledFunction(...args, 'div'),
  Div: (props?: any) => styledFunction(props?.css, 'div'),
});

function expandStyledFunction(a: any) {
  return typeof a === 'function' ? ('styles' in a ? a : a()) : a;
}

function getString(a: any) {
  return typeof a === 'string' ? a : !!a && a.elementName ? a.elementName : undefined;
}

export function isStaticStyleObject(obj: unknown): obj is StaticStyleObject {
  if (!obj || typeof obj !== 'function') {
    return false;
  }
  const staticStyle = (obj as unknown) as StaticStyleObject;
  return !!staticStyle.styles;
}
