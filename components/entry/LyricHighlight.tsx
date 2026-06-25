import { View, Text, StyleSheet } from 'react-native'
import { Colors } from '@/constants/colors'

interface Props {
  text:     string
  compact?: boolean
}

export function LyricHighlight({ text, compact = false }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.quote}>"</Text>
      <Text style={[styles.lyric, compact && styles.lyricCompact]} numberOfLines={compact ? 2 : undefined}>
        {text}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    paddingLeft:     12,
    marginVertical:  8,
  },
  quote: {
    color:        Colors.primary,
    fontSize:     24,
    fontWeight:   '700',
    lineHeight:   20,
    marginBottom: 2,
  },
  lyric: {
    color:      Colors.text,
    fontSize:   15,
    fontStyle:  'italic',
    lineHeight: 22,
  },
  lyricCompact: {
    fontSize: 13,
  },
})
