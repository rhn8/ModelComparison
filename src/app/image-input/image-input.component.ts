import { Component, EventEmitter, Output, ViewChild} from '@angular/core';
import { bodyPixInference, mediaPipeInference, bodyPoseInference } from '../utils/tfjsBodyseg';
import { MemoryService } from '../services/memory.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-input.component.html',
  styleUrl: './image-input.component.css'
})
export class ImageInputComponent {
  
  constructor(private memoryService:MemoryService){} // Gives access to approximate memory usage


  @Output() dataEmitter = new EventEmitter<any>

  sendToParent(model,inference,memory){
    // Sends the data to AppComponent, which relays to model-resultsComponent
    const data = [model,inference,memory]
    this.dataEmitter.emit(data)
  }


  file:any;
  imageSrc: string | ArrayBuffer | null = null;
  button:any;
  memory: any
  


  BodyPix(){
    //Runs BodyPix inference on uploaded image and draws a blurring mask
    try{
    bodyPixInference().then(perf =>{
      console.log(this.memoryService.getMemoryUsage().subscribe(data =>{
        this.memory = data.memory
      }))
      
      this.memory = navigator.deviceMemory;
      
      this.sendToParent("BodyPix", perf,this.memory)})
    
    }
    catch (error){
      console.log(error)
    }

    
  }

  MediaPipe(){
    //Runs Mediapipe inference on uploaded image and draws a blurring mask
    try{
      mediaPipeInference().then(perf =>{
        console.log(perf)

        this.memory = navigator.deviceMemory
  
        this.sendToParent("MediaPipe", perf, this.memory)})
      
      }
      catch (error){
        console.log(error)
      }
    
  }

  BodyPoseInference(){
      //Runs BodyPose inference on uploaded image and draws a blurring mask based on detected KeyPoints
    try{
      bodyPoseInference().then(perf =>{
        console.log(perf)
  
        this.sendToParent("BodyPose", perf, navigator.deviceMemory)})
      
      }
      catch (error){
        console.log(error)
      }


  }

  onChangeFile(event: any){
    // Loads uploaded image and gives a preview
    this.file = event.target.files[0];
    const preview = document.getElementById("ImageView")
  

    const reader = new FileReader();

    reader.onload = () => {
      this.imageSrc = reader.result;
      preview.style.display = "block"

       // Set the image source to the file data
    };

    reader.readAsDataURL(this.file); // Convert the file to a data URL


  }



}
