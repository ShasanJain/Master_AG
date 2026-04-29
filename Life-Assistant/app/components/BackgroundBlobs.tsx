import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '@/constants/Theme';

export default function BackgroundBlobs() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[styles.blob, styles.blob1]} />
      <View style={[styles.blob, styles.blob2]} />
    </View>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.1,
  },
  blob1: {
    top: -100,
    left: -50,
    backgroundColor: Colors.primary,
  },
  blob2: {
    bottom: 50,
    right: -100,
    backgroundColor: Colors.accent,
  },
});
