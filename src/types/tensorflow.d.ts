declare module '@tensorflow/tfjs' {
  export function ready(): Promise<void>;
}

declare module '@tensorflow-models/pose-detection' {
  export interface Keypoint {
    x: number;
    y: number;
    score?: number;
    name?: string;
  }

  export interface Pose {
    keypoints: Keypoint[];
    score?: number;
  }

  export interface PoseDetector {
    estimatePoses(image: HTMLImageElement): Promise<Pose[]>;
  }

  export enum SupportedModels {
    MoveNet = 'MoveNet',
  }

  export interface MoveNetModelConfig {
    modelType: 'SinglePose.Lightning' | 'SinglePose.Thunder' | 'MultiPose.Lightning';
    enableSmoothing?: boolean;
  }

  export function createDetector(
    model: SupportedModels,
    config?: MoveNetModelConfig
  ): Promise<PoseDetector>;
} 