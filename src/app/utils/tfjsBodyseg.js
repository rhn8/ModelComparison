 import { createSegmenter, SupportedModels, blurBodyPart , toBinaryMask} from '@tensorflow-models/body-segmentation';
 import { createDetector, SupportedModels as PoseModels } from '@tensorflow-models/pose-detection';
 import { skinDetection } from './skinDetect.js';
import {imageDataRGBA} from "stackblur-canvas"
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

async function mediaPipeSegmenter() {
  // generates the MediaPipe segmenter object for inference

    initializeTensorFlow()
    const model = "MediaPipeSelfieSegmentation";
        const segmenterConfig = {
        runtime: 'mediapipe', // or 'tfjs'
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation',
        modelType: 'general',
        architecture: 'ResNet50',
        outputStride: 32,
        quantBytes: 4,
        multiplier: 1.0
        };

    const segmenter = await createSegmenter(model, segmenterConfig)

    return segmenter
}


async function bodyPixSegmenter(){
    // generates the BodyPix segmenter object for inference

    initializeTensorFlow()

    const model = SupportedModels.BodyPix
    const segmenterConfig = {
        architecture: 'ResNet50',
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation',
        modelType: 'general',
        outputStride: 32,
        quantBytes: 4,
        multiplier: 1.0
        };



    const segmenter = await createSegmenter(model, segmenterConfig)


    return segmenter
}

async function bodyPoseDetector(){
  //Generates the BodyPose detector for inference
  const detectorConfig = {
    architecture: 'MobileNetV1',
    outputStride: 16,
    inputResolution: { width: 600, height: 400 },
    multiplier: 0.75
  };

  const detector = await createDetector(PoseModels.PoseNet, detectorConfig);
  return detector

  
}



/** 
   *  Blurs any skin being shown on the body other than the face for
   *  every image.
   * 
   *  Applys BodyPix model to a given image to obtain a mask 
   * and applies blurring by filtering the mask with a skin detection
   * algorithm, blurring pixels which fall within the intersections of
   * the two masks.
   * 
   * @returns A list of the inference times for each image
*/
export async function bodyPixInference(){

  checkInitialRuns(0)

    initializeTensorFlow()
    const images = document.querySelectorAll("img");

    var imageArray = Array.from(images)

    var res= await Promise.all(imageArray.map(async (img) => {

    var s = performance.now()
    
    const segmenter = await bodyPixSegmenter()

    
    const h = img.height;
    const w = img.width;
    
    img.width = 600;
    img.height = h/w * img.width;

    

    const people = await segmenter.segmentPeople(img,{multiSegmentation: false, segmentBodyParts: true,maxDetections:20});

    
    await applyBlurring(img,people,h,w)

    

    var end = performance.now();

    var result = end - s
    return result
    }))



    return new Promise((resolve)=>{
      resolve(res[0])

    })


}

/**
 * Blocks out skin being shown on the body besides the face using
 * a bounding box 
 * 
 * Applys BodyPose model to a given image to obtain keypoints,
 * drawing a bounding box based on the positions of the shoulders and
 * knees, and applies skin detection blurring to pixels within the 
 * bounding box region.
 * 
 * @returns A list of the inference times for each image
 *
 */
export async function bodyPoseInference(){
//Runs BodyPose inference on a given uploaded image.

  initializeTensorFlow()
  
  const detector = await bodyPoseDetector()

  const images = document.querySelectorAll('img')

  var imageArray = Array.from(images)

  var res= await Promise.all(imageArray.map(async (img) => {

    await checkInitialRuns(2)

    const s = performance.now()

    const poses = await detector.estimatePoses(img,estimationConfig);


    const canvas = document.createElement('canvas')

    const [height, width] = [400,600];
    canvas.width = width;
    canvas.height = height;
    const octx = canvas.getContext('2d');
    

      // Draw the image onto the canvas
    octx.drawImage(img, 0, 0, img.width, img.height);

    drawPoses(poses, octx)

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

/**
 * Blurs out the background of a person inside an image
 * 
 * Applys MediaPipeSelfieSegmenter to every image, and 
 * given the mask obtained, blurs out every pixel 
 * highlighted within the mask.
 * 
 * @returns A list of the inference times for each image
 */
export async function mediaPipeInference(){
// Performs inference using MediePipeSelfieSegmentation model

  initializeTensorFlow()

  checkInitialRuns(1)

  const images = document.querySelectorAll("img");

  var imageArray = Array.from(images)

  var res= await Promise.all(imageArray.map(async (img) => {


  var s = performance.now()
  
  const segmenter = await mediaPipeSegmenter()

  
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
/**
 * Given a list of ImageData objects, draws the image and applies
 * BodyPix model to each image and for each person, blurs any region
 * showing skin besides faces.
 * 
 * @param {*} imageArray An array of ImageData Objects
 * @returns A list of the inference times for each ImageData
 */
export async function multiInference(imageArray) {
  // Runs multiple image inference using BodyPix
  console.log("Initializing TensorFlow...");
  initializeTensorFlow();

  var timings = [];
  const segmenter = await bodyPixSegmenter();
  console.log("Segmenter initialized:", segmenter);

  let count = 0;

  for (const image of imageArray) {
    console.log(`Processing image ${count + 1} out of ${imageArray.length}`);

    const row = document.getElementById(`${count}`);
    count += 1;
    const cell = document.createElement('td');


    // const img = document.createElement('img');
    // const canvas = document.createElement('canvas');
    // const ctx = canvas.getContext('2d');

    // canvas.height = image.height;
    // canvas.width = image.width;

    // ctx.putImageData(image, 0, 0);
    // const dataURL = canvas.toDataURL();
    // img.src = dataURL;


    const [canvas, ctx, img] =  loadContext(image)


    const h = img.height;
    const w = img.width;

    // Optionally scale the image, if needed
    // img.width = 600;
    // img.height = h/w * img.width;

    cell.appendChild(img);
    row.appendChild(cell);

    try {
      const start = performance.now();

      // Run inference on the image
      const people = await segmenter.segmentPeople(canvas, { multiSegmentation: false, segmentBodyParts: true });

      // Extract the image data
      // const imgData = await people[0].mask.toImageData();

      await applyBlurring(img, people, h, w);

      const end = performance.now();
      timings.push(end - start);
    } catch (error) {
      console.error(`Error processing image ${count}:`, error);
    }
  }

  return await timings.slice(1);
}


/**
 * Given a list of ImageData objects, draws the image and applies
 * BodyPose model to each image and blurs every pixel showing skin
 * between the shoulders and knees.
 * 
 * @param {*} imageArray An array of ImageData Objects
 * @returns A list of the inference times for each ImageData
 */
export async function multiBodyPose(imageArray){
  // runs inference for the BodyPose model on multiple images
  initializeTensorFlow()
  var timings = []

  const detector = await bodyPoseDetector()
  let count = 0;

  for (const image of imageArray){

    const row = document.getElementById(`${count}`);
    count += 1;
    const cell = document.createElement('td');



    const [canvas,ctx, img] =  loadContext(image)


    cell.appendChild(img);
    row.appendChild(cell);


    const start =performance.now()

    const poses = await detector.estimatePoses(image,estimationConfig)

    drawPoses(poses,ctx)

    ctx.restore();

    var dataURL2 = canvas.toDataURL();

    img.src = dataURL2

    const end = performance.now()
    timings.push(end - start)

  }
  return await timings.slice(1)


}



function drawPoses(poses,octx){

  for (const pose of poses){
    const keypoints = pose.keypoints
    if (pose.keypoints != null) {
      // Obtain the width and height of the rectangle formed between the left shoulder and right thigh keypoints
      const w = Math.round(Math.abs(keypoints[6].x-keypoints[13].x))
      const h =Math.round(Math.abs(keypoints[6].y-keypoints[13].y))


      drawKeypoints(pose.keypoints,octx);

      const imgData = octx.getImageData(Math.round(keypoints[6].x),Math.round(keypoints[6].y)  ,w*1.25, h*1.25)
      var mask = skinDetection(imgData)
      var idata = new ImageData(mask,w*1.25,h*1.25)
      octx.putImageData(idata,Math.round(keypoints[6].x),Math.round(keypoints[6].y) )

      drawConnections(pose.keypoints, octx)

      
    }
  }


}

async function checkInitialRuns(n){

  if (initialRuns[n]){
    initialRuns[n] = false
    _ = await createDetector()
    _ = await detector.estimatePoses(img,estimationConfig)
  }



}

function loadContext(image){

  const img = document.createElement('img');
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.height = image.height;
  canvas.width = image.width;

  ctx.putImageData(image, 0, 0);
  const dataURL = canvas.toDataURL();
  img.src = dataURL;

  return [canvas, ctx, img]



}

function drawConnections(keypoints,ctx){
  const pointConnections = {
    5: 6,
    6: 12,
    7: 5,
    8: 6,
    9: 7,
    10: 8,
    11: 5,
    12: 11,
    13: 11,
    14: 12,
    15: 13,
    16: 14
  };

  for (let i=5; i < keypoints.length; i++){
    ctx.strokeStyle = 'red'

    const line = new Path2D();
    line.moveTo(keypoints[i].x,keypoints[i].y)

    var j = pointConnections[i]

    line.lineTo(keypoints[j].x,keypoints[j].y)
    ctx.lineWidth = 20
    ctx.stroke(line)
  }
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
    const circle = new Path2D();
    circle.arc(keypoint.x, keypoint.y, radius, 0, 2 * Math.PI);
    ctx.fill(circle);
    ctx.stroke(circle);
  }
}

async function applyBlurring(img, people, h, w) {
  
  // Get segmentation mask from people
  var mask = await people[0].mask.toImageData();
  var maskdata = mask.data;

  // Create a canvas with the correct image dimensions
  const ocanvas = document.createElement("canvas");
  const octx = ocanvas.getContext("2d");

  // Set canvas dimensions to match the original image dimensions (h, w)
  ocanvas.width = w;
  ocanvas.height = h;


  // Draw the image at the original size
  octx.drawImage(img, 0, 0, ocanvas.width, ocanvas.height);

  const odata = octx.getImageData(0, 0, ocanvas.width, ocanvas.height).data;
  octx.filter = 'blur(10px)';
  // Get image data after drawing
  var data = octx.getImageData(0, 0, ocanvas.width, ocanvas.height).data;
  

  // var data = imageDataRBGA(data)

  // var data = adjustWhiteBalance(data)


  // Perform skin detection (assuming skinDetection function returns a valid mask)
  const skinmask = skinDetection(new ImageData(data, ocanvas.width, ocanvas.height));

  // Iterate through mask data and apply blurring logic
  for (let i = 0; i < maskdata.length; i += 4) {
    if (maskdata[i] > 2 && maskdata[i + 3] > 200) {
      //&& skinmask[i + 3] == 20
      maskdata[i] = 255;
      maskdata[i + 1] = odata[i + 1];
      maskdata[i + 2] = odata[i + 2];
    } else {
      maskdata[i] = odata[i];
      maskdata[i + 1] = odata[i + 1];
      maskdata[i + 2] = odata[i + 2];
      maskdata[i + 3] = odata[i + 3];
    }
  }

  // Create a new canvas for the output
  const canvas = document.createElement("canvas");
  canvas.width = w;   // Match the original image width
  canvas.height = h;  // Match the original image height
  const ctx = canvas.getContext("2d");

  // Create a new ImageData object with the mask data and correct dimensions
  const imgd = new ImageData(maskdata, w, h);
  ctx.putImageData(imgd, 0, 0);

  // Convert the canvas to a data URL and apply it to the original image
  var dataURL = canvas.toDataURL();
  img.src = dataURL;

}
