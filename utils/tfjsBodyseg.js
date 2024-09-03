import * as bodySegmentation from '@tensorflow-models/body-segmentation';
import '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-converter';
// Register WebGL backend.
import '@tensorflow/tfjs-backend-webgl';

async function MediaPipeSegmenter(img) {
    const model = "MediaPipeSelfieSegmentation";
        const segmenterConfig = {
        runtime: 'mediapipe', // or 'tfjs'
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation',
        modelType: 'general',
        outputStride: 16,
        quantBytes: 2,
        multiplier: 0.75
        };

    const segmenter = await bodySegmentation.createSegmenter(model, segmenterConfig)

    const people = await segmenter.segmentPeople(img,{multiSegmentation: false, segmentBodyParts: true});

}


async function BodyPixSegmentor(img){
    const model = bodySegmentation.SupportedModels.BodyPix
    const segmenterConfig = {
        runtime: 'tfjs',
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation',
        modelType: 'general',
    }

    const segmenter = await bodySegmentation.createSegmenter(model, segmenterConfig)

    const people = await segmenter.segmentPeople(img,{multiSegmentation: false, segmentBodyParts: true});
}
