import {
  Modal, View, Text, TouchableOpacity,
  TouchableWithoutFeedback, StyleSheet,
} from 'react-native'
import { Colors } from '@/constants/colors'

export interface ModalButton {
  label: string
  style?: 'default' | 'cancel' | 'destructive'
  onPress?: () => void
}

interface Props {
  visible: boolean
  onClose: () => void
  title: string
  message?: string
  buttons: ModalButton[]
  variant?: 'sheet' | 'dialog'
}

export function AppModal({ visible, onClose, title, message, buttons, variant = 'dialog' }: Props) {
  function handlePress(btn: ModalButton) {
    onClose()
    btn.onPress?.()
  }

  const cancelBtn  = buttons.find(b => b.style === 'cancel')
  const actionBtns = buttons.filter(b => b.style !== 'cancel')

  if (variant === 'sheet') {
    return (
      <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose} statusBarTranslucent>
        <View style={styles.sheetOverlay}>
          <TouchableWithoutFeedback onPress={onClose}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>

          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>{title}</Text>
            {message ? <Text style={styles.sheetMessage}>{message}</Text> : null}

            <View style={styles.sheetActions}>
              {actionBtns.map((btn, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.sheetBtn, i > 0 && styles.sheetBtnBorder]}
                  onPress={() => handlePress(btn)}
                  activeOpacity={0.65}
                >
                  <Text style={[styles.sheetBtnText, btn.style === 'destructive' && styles.destructiveText]}>
                    {btn.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {cancelBtn && (
              <TouchableOpacity
                style={[styles.sheetBtn, styles.cancelSheetBtn]}
                onPress={() => handlePress(cancelBtn)}
                activeOpacity={0.65}
              >
                <Text style={styles.cancelText}>{cancelBtn.label}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    )
  }

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.dialogOverlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFillObject} />
        </TouchableWithoutFeedback>

        <View style={styles.dialog}>
          <View style={styles.dialogBody}>
            <Text style={styles.dialogTitle}>{title}</Text>
            {message ? <Text style={styles.dialogMessage}>{message}</Text> : null}
          </View>

          <View style={styles.dialogDivider} />

          <View style={styles.dialogBtns}>
            {cancelBtn && (
              <TouchableOpacity
                style={[styles.dialogBtn, actionBtns.length > 0 && styles.dialogBtnBorder]}
                onPress={() => handlePress(cancelBtn)}
                activeOpacity={0.65}
              >
                <Text style={styles.cancelText}>{cancelBtn.label}</Text>
              </TouchableOpacity>
            )}
            {actionBtns.map((btn, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.dialogBtn, cancelBtn && i === 0 ? null : i > 0 && styles.dialogBtnBorder]}
                onPress={() => handlePress(btn)}
                activeOpacity={0.65}
              >
                <Text style={[
                  styles.dialogActionText,
                  btn.style === 'destructive' && styles.destructiveText,
                ]}>
                  {btn.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  // ── Sheet ──────────────────────────────────────────────────────────────────
  sheetOverlay:   { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.65)' },
  sheet:          { backgroundColor: Colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 36, paddingTop: 10 },
  handle:         { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.surfaceAlt, alignSelf: 'center', marginBottom: 16 },
  sheetTitle:     { color: Colors.text, fontSize: 17, fontWeight: '600', textAlign: 'center', paddingHorizontal: 20 },
  sheetMessage:   { color: Colors.textMuted, fontSize: 13, textAlign: 'center', marginTop: 4, paddingHorizontal: 20, marginBottom: 4 },
  sheetActions:   { marginTop: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  sheetBtn:       { paddingVertical: 16, alignItems: 'center', paddingHorizontal: 20 },
  sheetBtnBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  sheetBtnText:   { color: Colors.text, fontSize: 17 },
  cancelSheetBtn: { marginTop: 8, borderTopWidth: 1, borderTopColor: Colors.border },
  cancelText:     { color: Colors.textMuted, fontSize: 17 },

  // ── Dialog ─────────────────────────────────────────────────────────────────
  dialogOverlay:  { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.65)' },
  dialog:         { width: '78%', backgroundColor: Colors.surface, borderRadius: 16, overflow: 'hidden' },
  dialogBody:     { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 18, alignItems: 'center' },
  dialogTitle:    { color: Colors.text, fontSize: 17, fontWeight: '600', textAlign: 'center' },
  dialogMessage:  { color: Colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 6, lineHeight: 20 },
  dialogDivider:  { height: 1, backgroundColor: Colors.border },
  dialogBtns:     { flexDirection: 'row' },
  dialogBtn:      { flex: 1, paddingVertical: 15, alignItems: 'center', justifyContent: 'center' },
  dialogBtnBorder:{ borderLeftWidth: 1, borderLeftColor: Colors.border },
  dialogActionText:{ color: Colors.primary, fontSize: 17, fontWeight: '600' },
  destructiveText:{ color: Colors.error },
})
