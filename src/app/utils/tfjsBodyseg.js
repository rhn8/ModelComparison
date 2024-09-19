 import { createSegmenter, SupportedModels, blurBodyPart } from '@tensorflow-models/body-segmentation';
 import { createDetector, SupportedModels as PoseModels } from '@tensorflow-models/pose-detection';
 import { skinDetection } from './skinDetect.js';
 var initialRuns = [true,true,true] // check if its the first run of the models: [BodyPix,MediaPipe,BodyPose]
const estimationConfig = {
  maxPoses: 20,
  flipHorizontal: false,
  scoreThreshold: 0.5,
  nmsRadius: 20
};
 
 async function initializeTensorFlow() {
    try {
      // Load TensorFlow.js libraries
      await import('@tensorflow/tfjs-core');
      await import('@mediapipe/selfie_segmentation')
      await import('@tensorflow/tfjs-backend-webgl');
      console.log('TensorFlow.js libraries loaded');
  
    
      // Use the loaded modules here
    } catch (error) {
      console.error('Error initializing TensorFlow.js:', error);
    }
  }

async function MediaPipeSegmenter() {
  // generates the MediaPipe segmenter object for inference

    initializeTensorFlow()
    const model = "MediaPipeSelfieSegmentation";
        const segmenterConfig = {
        runtime: 'mediapipe', // or 'tfjs'
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation',
        modelType: 'general',
        outputStride: 16,
        quantBytes: 2,
        multiplier: 0.75
        };

    const segmenter = await createSegmenter(model, segmenterConfig)

    return segmenter
}


async function BodyPixSegmenter(){
    // generates the BodyPix segmenter object for inference

    initializeTensorFlow()

    const model = SupportedModels.BodyPix
    const segmenterConfig = {
        runtime: 'tfjs',
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation',
        modelType: 'general',
    }

    const segmenter = await createSegmenter(model, segmenterConfig)


    return segmenter
}

export async function bodyPixInference(){

  if (initialRuns[0]){
    // Prepares the model to be cached
    initialRuns[0] = false
    s = await BodyPixSegmenter()
    _ = await s.segmentPeople(new Image(),{multiSegmentation: false, segmentBodyParts: true});
  }

    initializeTensorFlow()
    const images = document.querySelectorAll("img");
    console.log(images)

    var imageArray = Array.from(images)

    var res= await Promise.all(imageArray.map(async (img) => {

        var s = performance.now()
    
    const segmenter = await BodyPixSegmenter()
    
    const h = img.height;
    const w = img.width;

    img.width = 600;
    img.height = h/w * img.width;

    const people = await segmenter.segmentPeople(img,{multiSegmentation: false, segmentBodyParts: true});

    
    await applyBlurring(img,people,h,w)
    var end = performance.now();

    var result = end - s
    console.log(result)
    return result
    }))



    return new Promise((resolve)=>{
      resolve(res[0])

    })


}

async function applyBlurring(img,people,h,w){
  // applys blurring on a HTML image element using the segmentation obtained from MediaPipe/BodyPix
  const foregroundThreshold = 0.5;
    const backgroundBlurAmount = 10;
    const edgeBlurAmount = 10;
    const flipHorizontal = false;
    const faceBodyPartIdsToBlur = [0, 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18];

    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    
    await blurBodyPart(
      canvas, img, people, faceBodyPartIdsToBlur, foregroundThreshold,
      backgroundBlurAmount, edgeBlurAmount, flipHorizontal);
    
    var dataURL = canvas.toDataURL();
    img.height = h
    img.width = w
    img.src = dataURL

}



function drawKeypoints(keypoints,ctx) {
// Draws the keypoints of a detected person
  ctx.fillStyle = 'Green';
  ctx.strokeStyle = 'White';
  ctx.lineWidth = 2;
  for(let i=0; i<keypoints.length; i++) {
      drawKeypoint(keypoints[i],ctx);    
  }
}

function drawKeypoint(keypoint,ctx) {
  //Draws a keypoint onto a canvas contex as long as it's not a part of the face.

  const faceParts = ['nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear']
  const scoreThreshold = 0.1
  const radius = 4;

  if (keypoint.score >= scoreThreshold & !faceParts.includes(keypoint.name)) {
    console.log(keypoint)
    const circle = new Path2D();
    circle.arc(keypoint.x, keypoint.y, radius, 0, 2 * Math.PI);
    ctx.fill(circle);
    ctx.stroke(circle);
  }
}

export async function bodyPoseInference(){
//Runs BodyPose inference on a given uploaded image.

  initializeTensorFlow()

  
  const detector = await bodyPoseDetector()

  const images = document.querySelectorAll('img')

  var imageArray = Array.from(images)


  var res= await Promise.all(imageArray.map(async (img) => {

    if (initialRuns[2]){
      initialRuns[2] = false
      _ = await createDetector()
      _ = await detector.estimatePoses(img,estimationConfig)
    }
    const s = performance.now()


    const poses = await detector.estimatePoses(img,estimationConfig);


    const canvas = document.createElement('canvas')

    const [height, width] = [400,600];
    canvas.width = width;
    canvas.height = height;
    const octx = canvas.getContext('2d');
    



      // Draw the image onto the canvas
    octx.drawImage(img, 0, 0, img.width, img.height);

    for (const pose of poses){
      const keypoints = pose.keypoints
      if (pose.keypoints != null) {
        // Obtain the width and height of the rectangle formed between the left shoulder and right thigh keypoints
        const w = Math.round(Math.abs(keypoints[6].x-keypoints[13].x))
        const h =Math.round(Math.abs(keypoints[6].y-keypoints[13].y))


        drawKeypoints(pose.keypoints,octx);

        const imgData = octx.getImageData(Math.round(keypoints[6].x),Math.round(keypoints[6].y)  ,w*1.25, h*1.25)
        var mask = skinDetection(imgData)
        console.log(mask)
        var idata = new ImageData(mask,w*1.25,h*1.25)
        octx.putImageData(idata,Math.round(keypoints[6].x),Math.round(keypoints[6].y) )
        
      }
    }

    octx.restore();

    var dataURL = canvas.toDataURL();
    img.src = dataURL
    

    const end = performance.now()
    const result = end - s
    return result
  }))
  return new Promise((resolve)=>{
    resolve(res[0])})

}


export async function mediaPipeInference(){
// Performs inference using MediePipeSelfieSegmentation model
  if (initialRuns[1]){
    initialRuns[1] = false
    const s = await MediaPipeSegmenter()
    _ = await s.segmentPeople(new Image(),{multiSegmentation: false, segmentBodyParts: true});
  }
  initializeTensorFlow()
  const images = document.querySelectorAll("img");
  console.log(images)

  var imageArray = Array.from(images)

  var res= await Promise.all(imageArray.map(async (img) => {

  var s = performance.now()
  
  const segmenter = await MediaPipeSegmenter()

  
  const h = img.height;
  const w = img.width;

  img.width = 600;
  img.height = h/w * img.width;

  const people = await segmenter.segmentPeople(img,{multiSegmentation: false, segmentBodyParts: true});

  await applyBlurring(img,people,h,w)


  var end = performance.now();

  var result = end - s
  return result
  }))



  return new Promise((resolve)=>{
    resolve(res[0])

  })


}

export async function multiInference(imageArray){
  // Runs multiple image inference using BodyPix
  initializeTensorFlow()
  var timings = []


  const segmenter = await BodyPixSegmenter()


  for (const image of imageArray){
    const start = performance.now()

    const people = await segmenter.segmentPeople(image,{multiSegmentation: false, segmentBodyParts: true});

    const end = performance.now()
    timings.push(end - start)

  }
  return await timings.slice(1)
}

export async function multiBodyPose(imageArray){
  // runs inference for the BodyPose model on multiple images
  initializeTensorFlow()
  var timings = []

  const detector = await bodyPoseDetector()

  for (const image of imageArray){
    const start =performance.now()

    const poses = detector.estimatePoses(image,estimationConfig)
    const end = performance.now()
    timings.push(end - start)

  }
  return await timings.slice(1)


}

async function bodyPoseDetector(){
  const detectorConfig = {
    architecture: 'MobileNetV1',
    outputStride: 16,
    inputResolution: { width: 600, height: 400 },
    multiplier: 0.75
  };

  const detector = await createDetector(PoseModels.PoseNet, detectorConfig);
  return detector

  
}
