import { useRouter, type Href } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

type State = { pressed: boolean };

export type TouchableProps = Omit<PressableProps, 'style' | 'children'> & {
  style?: StyleProp<ViewStyle> | ((s: State) => StyleProp<ViewStyle>);
  children?: ReactNode | ((s: State) => ReactNode);
};

/**
 * Pressable que resuelve él mismo el estado `pressed`: en react-native-web 0.21 el estilo
 * en forma de función no se aplica.
 */
export function Touchable({ style, children, onPressIn, onPressOut, ...props }: TouchableProps) {
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      {...props}
      onPressIn={(e) => {
        setPressed(true);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        setPressed(false);
        onPressOut?.(e);
      }}
      style={typeof style === 'function' ? style({ pressed }) : style}>
      {typeof children === 'function' ? children({ pressed }) : children}
    </Pressable>
  );
}

/** Touchable que navega a otra pantalla. */
export function PressLink({ href, replace, ...props }: TouchableProps & { href: Href; replace?: boolean }) {
  const router = useRouter();
  return (
    <Touchable
      accessibilityRole="link"
      onPress={() => (replace ? router.replace(href) : router.push(href))}
      {...props}
    />
  );
}
