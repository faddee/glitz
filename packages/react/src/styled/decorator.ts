import { Style, StyleArray } from '@glitz/type';
import { StyledElementLike } from './apply-class-name';
import { SECRET_DECORATOR } from './constants';
import create from './create';
import { isStyle, StyledCustom } from './custom';
import { StyledComponent, StyledComponentWithRef, StyledElementProps, StyledProps } from './types';

export interface StyledDecorator extends StyledCustom {
  [SECRET_DECORATOR]: true;
  (decorator: StyledDecorator): StyledDecorator;
  (): StyleArray;
}

export default function decorator(preStyle: StyleArray): StyledDecorator {
  const fn = (<TProps>(
    arg1?:
      | StyledElementLike<React.ComponentType<TProps & StyledElementProps>>
      | StyledComponentWithRef<TProps, any>
      | StyledComponent<TProps>
      | React.ComponentType<TProps & StyledProps>
      | StyledDecorator
      | Style,
    arg2?: Style,
  ) => {
    if (arg1) {
      if (isStyle(arg1)) {
        return decorator(preStyle.concat(arg1));
      }

      if (isDecorator(arg1)) {
        return decorator(preStyle.concat(arg1()));
      }

      return create<TProps>(arg1, arg2 ? preStyle.concat(arg2) : preStyle);
    }

    return preStyle;
  }) as StyledDecorator;

  fn[SECRET_DECORATOR] = true;

  return fn;
}

function isDecorator(
  value:
    | StyledElementLike<React.ComponentType<any>>
    | StyledComponent<any>
    | React.ComponentType<any>
    | StyledDecorator,
): value is StyledDecorator {
  return SECRET_DECORATOR in value;
}
