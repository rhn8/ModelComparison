declare module 'tfjsBodyseg'{
    export function MediaPipeSegmenter(): any
    export function BodyPixSegmenter(): any
    export function runInference(): any
    export function runInference2(): any
    export function cpuAverage(): any
    export function bodyPose(): any

}

declare module 'skinDetect'{
    export function skinDetection(ctx:any):Uint8ClampedArray
}