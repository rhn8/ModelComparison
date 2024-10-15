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

  imageUrls = [
    'https://t4.ftcdn.net/jpg/01/19/60/63/360_F_119606362_oyMJkJtowA2UFkqVrvOhaufoNhM8WzCA.jpg',
    'https://www.essence.com/wp-content/uploads/2019/07/Screen-Shot-2019-07-01-at-11.38.59-AM.png',
    'https://i.insider.com/5749c682dd08959a108b45f2?width=1136&format=jpeg',
    'https://theadultman.com/wp-content/uploads/2023/06/What-to-Wear-to-the-Beach-Man-leaning-on-surfboard-with-sunglasses-and-boardshorts.jpg',
    'https://img.lazcdn.com/g/p/6568fd0005ad37702077bf3fc3840bdf.jpg_720x720q80.jpg',
    'https://as2.ftcdn.net/v2/jpg/01/30/39/05/1000_F_130390516_xwiLvjAihxmo1S2w6X93U6FOpz5ksJdg.jpg',
    'https://c8.alamy.com/comp/HJBMYH/group-of-young-men-enjoying-a-day-at-the-beach-HJBMYH.jpg',
    'https://images.pexels.com/photos/33256/men-sea-people-swimming-trunks.jpg',
    ];
    
  





  async onChangeFile(event: any){
    this.imageList=[]
    // Load the image files onto an array of ImageData objects 
    this.files = event.target.files;
    const txt= document.getElementById("fileLoaded")
    txt.innerHTML = `Loaded ${this.files.length} files`
    let fileCount = 0

    for (const file of this.files){
      try {

        

        
        const imgdata =  await this.readImageFile(file,fileCount)
        this.imageList.push(imgdata)
        fileCount +=1
        
      } catch (error) {
        console.log("error reading image")
        
      }
      
      }

    
      for (const url of this.imageUrls){
        try {
          const imgdata =  await this.readImageLink(url,fileCount)
          this.imageList.push(imgdata)
          fileCount +=1
          
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


  async readImageLink(url,count){
    const table = document.getElementById("imageTable")


      const row = document.createElement('tr');
      row.setAttribute("id", `${count}`)
      const cell = document.createElement('td');
      const img = document.createElement('img');
      

      
      return new Promise((resolve) => {
        const temp = new Image();
        temp.src = url
        temp.crossOrigin = "Anonymous";

  
        temp.onload = function() {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = temp.width;
          canvas.height = temp.height;
          ctx.drawImage(temp, 0, 0,canvas.width,canvas.height);



  
          const imageData = ctx.getImageData(0, 0, temp.width, temp.height);

          img.src = canvas.toDataURL()

          cell.appendChild(img);
          row.appendChild(cell);
          table.appendChild(row);

          resolve(imageData)



          }

        

        

      })
  }


  async readImageFile(file,count){
    // Converts each image file into an ImageData object
      const url = URL.createObjectURL(file)

      const table = document.getElementById("imageTable")


      const row = document.createElement('tr');
      row.setAttribute("id", `${count}`)
      const cell = document.createElement('td');
      const img = document.createElement('img');
      

      
      return new Promise((resolve) => {
        const temp = new Image();
        temp.src = url
  
        temp.onload = function() {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = temp.width;
          canvas.height = temp.height;
          ctx.drawImage(temp, 0, 0,canvas.width,canvas.height);



  
          const imageData = ctx.getImageData(0, 0, temp.width, temp.height);

          img.src = canvas.toDataURL()

          cell.appendChild(img);
          row.appendChild(cell);
          table.appendChild(row);

          resolve(imageData)



          }

        

        

      })
  }

  multiBodyPix(){
    return new Promise((resolve,reject) => {

    // Apply BodyPix inference over the ImageData array to obtain a list of inference times stored in bodyPixResults attribute
    try {
      multiInference(this.imageList).then(res => {
        this.bodyPixInfo.avgInference = 0
        this.bodyPixResults = res
        console.log(res)

        this.bodyPixResults.forEach(num => {
          this.bodyPixInfo.avgInference += num / res.length
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
        this.bodyPoseInfo.avgInference = 0
        this.bodyPoseResults = res
        console.log(res)

        this.bodyPoseResults.forEach(num =>{
          this.bodyPoseInfo.avgInference+= num / res.length
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

