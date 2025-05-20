import { onMounted, onUnmounted, type Ref } from 'vue';

export function useFlipDetection(
  elRef: Ref<HTMLElement | null>,
  callback: (rotation: number) => void,
  flipThreshold: number = 180
) {
  let animationFrameId: number;
  let accumulatedRotation = 0;
  let lastAngle = 0;

  const getRotationAngle = (matrix: string): number => {
    if (!matrix || matrix === 'none') return 0;

    const values = matrix.split('(')[1].split(')')[0].split(',');
    const m21 = parseFloat(values[4]);
    const m22 = parseFloat(values[5]);

    return Math.round(Math.atan2(m21, m22) * (180 / Math.PI)) % 360;
  };

  const detectRotation = () => {
    if (!elRef.value) return;

    const matrix = window.getComputedStyle(elRef.value).transform;
    const angle = getRotationAngle(matrix);
    const angleDifference = angle - lastAngle;

    if (!isNaN(angleDifference)) {
      accumulatedRotation += angleDifference;
    }

    if (Math.abs(accumulatedRotation) >= flipThreshold) {
      callback(accumulatedRotation);
      accumulatedRotation %= flipThreshold;
    }

    lastAngle = angle;
    animationFrameId = requestAnimationFrame(detectRotation);
  };

  const startDetection = () => {
    if (elRef.value) {
      lastAngle = getRotationAngle(window.getComputedStyle(elRef.value).transform);
      accumulatedRotation = 0;
      detectRotation();
    }
  };

  const stopDetection = () => {
    cancelAnimationFrame(animationFrameId);
  };

  onMounted(() => {
    if (elRef.value) startDetection();
  });

  onUnmounted(() => {
    stopDetection();
  });

  return {
    startDetection,
    stopDetection,
  };
}
