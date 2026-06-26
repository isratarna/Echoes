import { useState, useEffect } from 'react'
import {
  Modal, View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Dimensions, StatusBar,
} from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import * as ImageManipulator from 'expo-image-manipulator'
import { Colors } from '@/constants/colors'

const { width: SW } = Dimensions.get('window')
const PREVIEW_SIZE = Math.min(Math.round(SW * 0.72), 300)
const ZOOM_STEPS   = [1, 1.25, 1.5, 2, 2.5, 3]

type IoniconName = React.ComponentProps<typeof Ionicons>['name']

interface Props {
  visible: boolean
  uri: string
  onDone:   (editedUri: string) => void
  onCancel: () => void
}

function ToolBtn({
  icon, label, onPress, active = false,
}: { icon: IoniconName; label: string; onPress: () => void; active?: boolean }) {
  return (
    <TouchableOpacity
      style={[styles.toolBtn, active && styles.toolBtnActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name={icon} size={22} color={active ? Colors.primary : Colors.text} />
      <Text style={[styles.toolLabel, active && styles.toolLabelActive]}>{label}</Text>
    </TouchableOpacity>
  )
}

export function ImageEditor({ visible, uri, onDone, onCancel }: Props) {
  const [rotation, setRotation] = useState(0)
  const [flipH,    setFlipH]    = useState(false)
  const [flipV,    setFlipV]    = useState(false)
  const [zoomIdx,  setZoomIdx]  = useState(0)
  const [applying, setApplying] = useState(false)

  const zoom = ZOOM_STEPS[zoomIdx]

  useEffect(() => {
    if (visible) { setRotation(0); setFlipH(false); setFlipV(false); setZoomIdx(0) }
  }, [visible])

  function handleReset() {
    setRotation(0); setFlipH(false); setFlipV(false); setZoomIdx(0)
  }

  function handleCancel() { handleReset(); onCancel() }

  async function handleDone() {
    setApplying(true)
    try {
      const actions: ImageManipulator.Action[] = []
      if (rotation !== 0) actions.push({ rotate: rotation })
      if (flipH) actions.push({ flip: ImageManipulator.FlipType.Horizontal })
      if (flipV) actions.push({ flip: ImageManipulator.FlipType.Vertical })

      const rotated = await ImageManipulator.manipulateAsync(uri, actions, {
        format: ImageManipulator.SaveFormat.JPEG,
      })

      const cropSize = Math.floor(Math.min(rotated.width, rotated.height) / zoom)
      const final = await ImageManipulator.manipulateAsync(
        rotated.uri,
        [{
          crop: {
            originX: Math.floor((rotated.width  - cropSize) / 2),
            originY: Math.floor((rotated.height - cropSize) / 2),
            width:    cropSize,
            height:   cropSize,
          },
        }],
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
      )
      onDone(final.uri)
    } catch {
      onDone(uri)
    } finally {
      setApplying(false)
    }
  }

  const previewTransform = [
    { rotate: `${rotation}deg` },
    { scaleX: zoom * (flipH ? -1 : 1) },
    { scaleY: zoom * (flipV ? -1 : 1) },
  ]

  const statusParts: string[] = []
  if (rotation !== 0) statusParts.push(`${rotation}°`)
  if (zoom > 1)       statusParts.push(`${zoom}×`)
  if (flipH)          statusParts.push('Flip H')
  if (flipV)          statusParts.push('Flip V')

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleCancel}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

        {/* ── Header ─────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerSide} onPress={handleCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Photo</Text>
          <TouchableOpacity style={styles.headerSide} onPress={handleDone} disabled={applying}>
            {applying
              ? <ActivityIndicator color={Colors.primary} size="small" />
              : <Text style={styles.doneText}>Done</Text>
            }
          </TouchableOpacity>
        </View>

        {/* ── Preview ────────────────────────────────────────── */}
        <View style={styles.previewArea}>
          <View style={styles.previewRing}>
            <View style={styles.previewCircle}>
              <Image
                source={{ uri }}
                style={[styles.previewImg, { transform: previewTransform }]}
                contentFit="cover"
                cachePolicy="none"
              />
            </View>
          </View>

          <Text style={styles.statusLine}>
            {statusParts.length > 0 ? statusParts.join(' · ') : 'No adjustments'}
          </Text>
        </View>

        {/* ── Tools Panel ────────────────────────────────────── */}
        <View style={styles.toolsPanel}>

          <View style={styles.toolRow}>
            <ToolBtn
              icon="arrow-undo-outline"
              label="Rotate L"
              onPress={() => setRotation(r => (r - 90 + 360) % 360)}
              active={rotation !== 0}
            />
            <ToolBtn
              icon="arrow-redo-outline"
              label="Rotate R"
              onPress={() => setRotation(r => (r + 90) % 360)}
              active={rotation !== 0}
            />
            <ToolBtn
              icon="swap-horizontal-outline"
              label="Flip H"
              onPress={() => setFlipH(v => !v)}
              active={flipH}
            />
            <ToolBtn
              icon="swap-vertical-outline"
              label="Flip V"
              onPress={() => setFlipV(v => !v)}
              active={flipV}
            />
          </View>

          <View style={styles.sectionLabel}>
            <Ionicons name="search-outline" size={13} color={Colors.textMuted} />
            <Text style={styles.sectionLabelText}>Zoom</Text>
          </View>

          <View style={styles.zoomRow}>
            <TouchableOpacity
              style={[styles.zoomStepBtn, zoomIdx === 0 && styles.dimmed]}
              onPress={() => setZoomIdx(i => Math.max(0, i - 1))}
              disabled={zoomIdx === 0}
            >
              <Ionicons name="remove" size={20} color={zoomIdx === 0 ? Colors.textMuted : Colors.text} />
            </TouchableOpacity>

            <View style={styles.zoomTrack}>
              {ZOOM_STEPS.map((step, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setZoomIdx(i)}
                  hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
                >
                  <View style={i === zoomIdx ? styles.pipActive : styles.pip}>
                    {i === zoomIdx && (
                      <Text style={styles.pipLabel}>{step === 1 ? '1×' : `${step}×`}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.zoomStepBtn, zoomIdx === ZOOM_STEPS.length - 1 && styles.dimmed]}
              onPress={() => setZoomIdx(i => Math.min(ZOOM_STEPS.length - 1, i + 1))}
              disabled={zoomIdx === ZOOM_STEPS.length - 1}
            >
              <Ionicons name="add" size={20} color={zoomIdx === ZOOM_STEPS.length - 1 ? Colors.textMuted : Colors.text} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.resetRow} onPress={handleReset}>
            <Ionicons name="refresh-circle-outline" size={15} color={Colors.textMuted} />
            <Text style={styles.resetText}>Reset all</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  )
}

const TOOL_W = Math.floor((SW - 48) / 4)

const styles = StyleSheet.create({
  root:          { flex: 1, backgroundColor: Colors.background },

  // header
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 58, paddingHorizontal: 20, paddingBottom: 14 },
  headerSide:    { width: 72 },
  headerTitle:   { color: Colors.text, fontSize: 16, fontWeight: '600' },
  cancelText:    { color: Colors.textSecondary, fontSize: 16 },
  doneText:      { color: Colors.primary, fontSize: 16, fontWeight: '700', textAlign: 'right' },

  // preview
  previewArea:   { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14 },
  previewRing:   {
    width:  PREVIEW_SIZE + 6, height: PREVIEW_SIZE + 6,
    borderRadius: (PREVIEW_SIZE + 6) / 2,
    borderWidth: 2, borderColor: Colors.primary,
    padding: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  previewCircle: {
    width: PREVIEW_SIZE, height: PREVIEW_SIZE,
    borderRadius: PREVIEW_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceAlt,
  },
  previewImg:    { width: PREVIEW_SIZE, height: PREVIEW_SIZE },
  statusLine:    { color: Colors.textMuted, fontSize: 13, letterSpacing: 0.3 },

  // tools panel
  toolsPanel:    {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingTop: 22, paddingHorizontal: 16, paddingBottom: 40,
    gap: 16,
  },
  toolRow:       { flexDirection: 'row', justifyContent: 'space-between' },
  toolBtn:       {
    width: TOOL_W, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surfaceAlt, borderRadius: 14,
    paddingVertical: 12, gap: 6,
    borderWidth: 1, borderColor: 'transparent',
  },
  toolBtnActive: { backgroundColor: `${Colors.primary}18`, borderColor: Colors.primary },
  toolLabel:     { color: Colors.textMuted, fontSize: 11 },
  toolLabelActive: { color: Colors.primary },

  // section label
  sectionLabel:      { flexDirection: 'row', alignItems: 'center', gap: 5 },
  sectionLabelText:  { color: Colors.textMuted, fontSize: 12, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase' },

  // zoom
  zoomRow:       { flexDirection: 'row', alignItems: 'center', gap: 10 },
  zoomStepBtn:   {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surfaceAlt,
    justifyContent: 'center', alignItems: 'center',
  },
  dimmed:        { opacity: 0.35 },
  zoomTrack:     {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 20, height: 40, paddingHorizontal: 14,
  },
  pip:           { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.border },
  pipActive:     {
    width: 36, height: 26, borderRadius: 13,
    backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  pipLabel:      { color: '#fff', fontSize: 11, fontWeight: '700' },

  // reset
  resetRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  resetText:     { color: Colors.textMuted, fontSize: 13 },
})
