import { Component } from '@angular/core';
import { image } from '@tensorflow/tfjs-core';
import { multiInference, multiBodyPose } from '../utils/tfjsBodyseg';
import { MemoryService } from '../services/memory.service';

@Component({
  selector: 'app-mutliple-image-input',
  standalone: true,
  imports: [],
  templateUrl: './mutliple-image-input.component.html',
  styleUrl: './mutliple-image-input.component.css'
})
export class MutlipleImageInputComponent {

  constructor  (private memoryService:MemoryService) {}

  files:any
  imageList = []
  bodyPixResults = []
  bodyPoseResults = []
  bodyPixInfo = {
                avgInference:0,
                memory:0,
                maxInference:0,
                minInference:0
  }

  bodyPoseInfo ={
                avgInference:0,
                memory:0,
                maxInference:0,
                minInference:0
  }
  





  async onChangeFile(event: any){
    this.imageList=[]
    // Load the image files onto an array of ImageData objects 
    this.files = event.target.files;
    const txt= document.getElementById("fileLoaded")
    txt.innerHTML = `Loaded ${this.files.length} files`

    for (const file of this.files){
      try {
        
        const imgdata =  await this.readImageFile(file)
        this.imageList.push(imgdata)
        
      } catch (error) {
        console.log("error reading image")
        
      }
      
      }

      

    
    // Run inference on both models

    Promise.all([
    this.multiBodyPix(),
    this.multiBodyPoseInf()]).then(() =>{
       this.imageList = []
  })

  }


  async readImageFile(file){
    // Converts each image file into an ImageData object

      const url = URL.createObjectURL(file)

      
      return new Promise((resolve) => {
        const temp = new Image();
        temp.src = url
  
        temp.onload = function() {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = temp.width;
          canvas.height = temp.height;
          ctx.drawImage(temp, 0, 0);
  
          const imageData = ctx.getImageData(0, 0, temp.width, temp.height);

          resolve(imageData)

          }

        

        

      })
  }

  multiBodyPix(){
    return new Promise((resolve,reject) => {

    // Apply BodyPix inference over the ImageData array to obtain a list of inference times stored in bodyPixResults attribute
    try {
      multiInference(this.imageList).then(res => {

        this.bodyPixResults = res
        console.log(res)

        this.bodyPixResults.forEach(num => {
          this.bodyPixInfo.avgInference += num / this.bodyPixResults.length
        })
  
        this.bodyPixInfo.maxInference = Math.max(...this.bodyPixResults)
        this.bodyPixInfo.minInference = Math.min(...this.bodyPixResults)
        this.memoryService.getMemoryUsage().subscribe(data => {
        this.bodyPixInfo.memory = data.memory
        })

        

        
        resolve(null);

      }).catch(reject)

  
      
    } catch (error) {
      reject(error);
      
    }

  })


  }

  multiBodyPoseInf(){
        // Apply BodyPose inference over the ImageData array to obtain a list of inference times stored in bodyPoseResults attribute
    return new Promise((resolve,reject) => {

    try {
      multiBodyPose(this.imageList).then(res => {
        this.bodyPoseResults = res
        console.log(res)

        this.bodyPoseResults.forEach(num =>{
          this.bodyPoseInfo.avgInference+= num / this.bodyPoseResults.length
        })
        this.bodyPoseInfo.maxInference  = Math.max(...this.bodyPoseResults)
        this.bodyPoseInfo.minInference  = Math.min(...this.bodyPoseResults)
        this.memoryService.getMemoryUsage().subscribe(data => {
          this.bodyPoseInfo.memory = data.memory
      })

      resolve(null)
  
      }).catch(reject)

    

    } catch (error) {
      reject(error)
      
    }

  })



  }




}

