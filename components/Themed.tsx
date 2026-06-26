import { Text as DefaultText, View as DefaultView } from 'react-native'
import { Colors } from '@/constants/colors'

export type TextProps = DefaultText['props']
export type ViewProps = DefaultView['props']

export function Text(props: TextProps) {
  const { style, ...rest } = props
  return <DefaultText style={[{ color: Colors.text }, style]} {...rest} />
}

export function View(props: ViewProps) {
  const { style, ...rest } = props
  return <DefaultView style={[{ backgroundColor: Colors.background }, style]} {...rest} />
}
