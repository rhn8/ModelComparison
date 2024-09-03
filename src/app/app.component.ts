import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./header/header.component";
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ModelComparison';
  file:any;
  imageSrc: string | ArrayBuffer | null = null;

  onChangeFile(event: any){
    this.file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      this.imageSrc = reader.result;
       // Set the image source to the file data
    };

    reader.readAsDataURL(this.file); // Convert the file to a data URL


  }
}

